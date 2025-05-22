import express from 'express';
import Election from '../models/Election.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { sendElectionNotification } from '../utils/emailService.js';

const router = express.Router();

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find()
      .select('title description startDate endDate status candidates')
      .sort({ startDate: -1 });
    
    // Update status based on current date
    const now = new Date();
    const updatedElections = elections.map(election => {
      const electionObj = election.toObject();
      if (now < election.startDate) {
        electionObj.status = 'upcoming';
      } else if (now > election.endDate) {
        electionObj.status = 'completed';
      } else {
        electionObj.status = 'active';
      }
      return electionObj;
    });
    
    res.json(updatedElections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching elections', error: error.message });
  }
});

// Get election by ID
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Update status based on current date
    const now = new Date();
    const electionObj = election.toObject();
    if (now < election.startDate) {
      electionObj.status = 'upcoming';
    } else if (now > election.endDate) {
      electionObj.status = 'completed';
    } else {
      electionObj.status = 'active';
    }
    
    res.json(electionObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election', error: error.message });
  }
});

// Create new election (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate, candidates } = req.body;
    
    const election = new Election({
      title,
      description,
      startDate,
      endDate,
      candidates,
      createdBy: req.user.id
    });
    
    await election.save();

    // Send notification to all verified voters
    const voters = await User.find({ role: 'voter', isVerified: true });
    await Promise.all(
      voters.map(voter => 
        sendElectionNotification(voter.email, title, startDate)
      )
    );

    res.status(201).json({ message: 'Election created successfully', election });
  } catch (error) {
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
});

// Update election (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate, candidates, status } = req.body;
    
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if election has already started
    const now = new Date();
    if (now > election.startDate && (startDate || candidates)) {
      return res.status(400).json({ 
        message: 'Cannot modify start date or candidates once the election has started' 
      });
    }
    
    election.title = title || election.title;
    election.description = description || election.description;
    election.startDate = startDate || election.startDate;
    election.endDate = endDate || election.endDate;
    election.candidates = candidates || election.candidates;
    election.status = status || election.status;
    
    await election.save();
    res.json({ message: 'Election updated successfully', election });
  } catch (error) {
    res.status(500).json({ message: 'Error updating election', error: error.message });
  }
});

// Delete election (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if election has already started
    const now = new Date();
    if (now > election.startDate) {
      return res.status(400).json({ 
        message: 'Cannot delete an election that has already started' 
      });
    }
    
    await election.deleteOne();
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting election', error: error.message });
  }
});

// Get election results (available only after election ends)
router.get('/:id/results', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if election has ended
    const now = new Date();
    if (now < election.endDate) {
      return res.status(403).json({ 
        message: 'Results are only available after the election has ended' 
      });
    }
    
    const votes = await Vote.find({ election: req.params.id });
    
    // Count votes for each candidate
    const results = {};
    election.candidates.forEach(candidate => {
      results[candidate._id] = {
        candidate: candidate,
        voteCount: 0
      };
    });
    
    votes.forEach(vote => {
      if (results[vote.candidate]) {
        results[vote.candidate].voteCount++;
      }
    });
    
    // Convert to array and sort by vote count
    const sortedResults = Object.values(results).sort((a, b) => b.voteCount - a.voteCount);
    
    res.json({
      electionTitle: election.title,
      totalVotes: votes.length,
      results: sortedResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election results', error: error.message });
  }
});

export default router;