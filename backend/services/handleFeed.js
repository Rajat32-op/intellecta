const mongoose = require('mongoose');
const Post = require('../models/Post');

async function feedAlgo(req, res) {
  try {
    const user = req.user;
    const { lastScore, lastCreatedAt } = req.query;

    const now = new Date();
    const lambda = 0.06; // recency decay rate

    // convert to Date if present
    const lastCreatedAtDate = lastCreatedAt ? new Date(lastCreatedAt) : null;
    const lastScoreNum = lastScore ? parseFloat(lastScore) : null;

    const pipeline = [
      // 1) Only consider posts from last 7 days
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 3600 * 1000) }
        }
      },

      // 2) Add fields for scoring
      {
        $addFields: {
          ageHours: {
            $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 3600]
          },
          isFollowedAuthor: {
            $in: ['$userId', user.friends || []]
          }
        }
      },

      // 3) Compute score components
      {
        $addFields: {
          recencyDecay: { $exp: { $multiply: [-lambda, '$ageHours'] } },
          engagementScore: {
            $ln: {
              $add: [1, { $add: ['$likes', { $multiply: [2, '$comments'] }] }]
            }
          },
          followBoost: { $cond: ['$isFollowedAuthor', 1, 0] }
        }
      },

      // 4) Final score
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [0.6, '$recencyDecay'] },
              { $multiply: [0.3, '$engagementScore'] },
              { $multiply: [0.1, '$followBoost'] }
            ]
          }
        }
      }
    ];

    // 5) If cursor provided, filter out already-seen posts
    if (lastScoreNum !== null && lastCreatedAtDate) {
      pipeline.push({
        $match: {
          $or: [
            { score: { $lt: lastScoreNum } },
            {
              $and: [
                { score: lastScoreNum },
                { createdAt: { $lt: lastCreatedAtDate } }
              ]
            }
          ]
        }
      });
    }

    // 6) Sort & limit
    pipeline.push(
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: 20 }
    );

    const posts = await Post.aggregate(pipeline);

    // 7) Next cursor
    let nextCursor = null;
    if (posts.length === 20) {
      const last = posts[posts.length - 1];
      nextCursor = { lastScore: last.score, lastCreatedAt: last.createdAt };
    }
    res.status(200).json({ posts, nextCursor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong in feed algorithm' });
  }
}

module.exports = feedAlgo;