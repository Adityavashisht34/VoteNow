import express from 'express';
import Election from '../models/Election.js';
import Vote from '../models/Vote.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendVoteConfirmation } from '../utils/emailService.js';

const router = express.Router();
https://vote-now-lilac.vercel.app/
// Cast a vote
router.post('/vote', authenticateToken, async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user.id;

    
    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    const now = new Date();
    if (now < election.startDate) {
      return res.status(400).json({ message: 'Election has not started yet' });
    }
    
    if (now > election.endDate) {
      return res.status(400).json({ message: 'Election has already ended' });
    }
    
    // Check if the candidate exists in this election
    const candidateExists = election.candidates.some(
      candidate => candidate._id.toString() === candidateId
    );
    
    if (!candidateExists) {
      return res.status(400).json({ message: 'Invalid candidate' });
    }
    
    // Check if voter has already voted in this election
    const existingVote = await Vote.findOne({
      election: electionId,
      voter: userId
    });
    
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }
    
    // Create new vote
    const vote = new Vote({
      election: electionId,
      voter: userId,
      candidate: candidateId,
      voterIp: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    await vote.save();

    // // Send vote confirmation email
    // await sendVoteConfirmation(req.user.email, election.title);
    
    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error casting vote', error: error.message });
  }
});

// Get voter's voting history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user.id })
      .populate('election', 'title startDate endDate')
      .sort({ timestamp: -1 });
    
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voting history', error: error.message });
  }
});

// Check if voter has voted in a specific election
router.get('/check/:electionId', authenticateToken, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      election: req.params.electionId,
      voter: req.user.id
    });
    
    res.json({ hasVoted: !!vote });
  } catch (error) {
    res.status(500).json({ message: 'Error checking vote status', error: error.message });
  }
});

export default router;