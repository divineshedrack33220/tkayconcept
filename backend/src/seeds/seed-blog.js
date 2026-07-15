require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

const posts = [
  {
    title: 'Walking in Purpose: A Guide to Discovering Your Calling',
    content: `<p>Every person on this earth has a divine purpose. God has placed within each of us a unique calling that only we can fulfill. The journey to discovering that purpose begins with understanding who we are in Christ.</p>
<h2>Understanding Your Identity</h2>
<p>Before we can walk in purpose, we must first understand our identity. The Bible tells us that we are fearfully and wonderfully made (Psalm 139:14). This isn't just a feel-good verse — it's a declaration of truth about who you are.</p>
<p>When you understand that you are a child of God, created with intention and purpose, everything changes. You stop comparing yourself to others and start embracing the unique path God has laid out for you.</p>
<h2>Practical Steps to Discover Your Purpose</h2>
<ol>
<li><strong>Pray and seek God's face.</strong> Purpose is revealed through relationship with God.</li>
<li><strong>Identify your gifts and talents.</strong> What comes naturally to you? What do others see in you?</li>
<li><strong>Look for doors that God opens.</strong> When God opens a door, no man can shut it.</li>
<li><strong>Serve others.</strong> Purpose is often found in the intersection of your gifts and the needs of others.</li>
</ol>
<p>Remember, walking in purpose is not about perfection — it's about progress. Every step forward is a step closer to the life God designed for you.</p>`,
    excerpt: 'Every person has a divine purpose. Discover practical steps to align your life with God\'s plan and walk boldly in your calling.',
    category: 'purpose',
    tags: ['purpose', 'calling', 'faith', 'identity'],
    readTime: 6,
    status: 'published',
    publishedAt: new Date('2026-06-15'),
    views: 342,
  },
  {
    title: 'The Power of Faith-Based Games for Family Bonding',
    content: `<p>In a world filled with screens and distractions, finding meaningful ways to connect with family has never been more important. Faith-based games offer a unique opportunity to strengthen bonds while reinforcing the values that matter most.</p>
<h2>Why Games Matter for Families</h2>
<p>Games create a space where laughter flows naturally and conversations happen organically. When those games incorporate elements of faith, they become powerful tools for teaching and connection.</p>
<h2>Benefits of Faith-Based Gaming</h2>
<ul>
<li><strong>Creates shared experiences</strong> that become family memories</li>
<li><strong>Opens conversations</strong> about faith in a natural, fun setting</li>
<li><strong>Teaches important values</strong> like teamwork, patience, and perseverance</li>
<li><strong>Reduces screen time</strong> with engaging analog activities</li>
<li><strong>Spans generations</strong> — grandparents to grandchildren can play together</li>
</ul>
<h2>Making Game Night a Tradition</h2>
<p>Start small. Pick one night a week — maybe Friday or Saturday — and commit to it. The consistency matters more than the length of play. Even 30 minutes of intentional family time can make a lasting impact.</p>
<p>Consider starting with a game that encourages discussion, like our Faith & Family Board Game, which includes faith-based challenges that spark meaningful conversations while keeping everyone laughing.</p>`,
    excerpt: 'Discover how faith-based games can transform family time into meaningful bonding experiences that reinforce your values.',
    category: 'games',
    tags: ['games', 'family', 'bonding', 'faith'],
    readTime: 5,
    status: 'published',
    publishedAt: new Date('2026-06-22'),
    views: 187,
  },
  {
    title: 'Rooted Identity: What Does It Mean to Be Rooted in Christ?',
    content: `<p>The concept of being "rooted" appears throughout Scripture, and it carries profound meaning for every believer. Just as a tree draws nourishment from its roots, our spiritual life depends on how deeply we are rooted in Christ.</p>
<h2>Biblical Foundation</h2>
<p>Colossians 2:7 tells us to be "rooted and built up in him, strengthened in the faith as you were taught, and overflowing with thankfulness." This imagery is intentional — roots provide stability, nourishment, and growth.</p>
<h2>What Being Rooted Looks Like</h2>
<p>Being rooted in Christ means:</p>
<ul>
<li><strong>Stability</strong> — When storms come, you don't uproot</li>
<li><strong>Nourishment</strong> — You draw strength from God's Word daily</li>
<li><strong>Growth</strong> — You bear fruit that others can see and enjoy</li>
<li><strong>Identity</strong> — You know who you are regardless of circumstances</li>
</ul>
<h2>Practical Ways to Deepen Your Roots</h2>
<p>Start with daily Scripture reading. Not just a quick verse, but deep, thoughtful engagement with God's Word. Pair that with prayer, community, and worship, and watch your roots grow deeper each day.</p>
<p>Our Rooted Identity collection was created to serve as daily reminders of this truth. Every product is designed to point you back to the foundation of your identity in Christ.</p>`,
    excerpt: 'Explore the biblical meaning of being rooted in Christ and how it shapes your identity, stability, and spiritual growth.',
    category: 'identity',
    tags: ['identity', 'rooted', 'christ', 'faith'],
    readTime: 7,
    status: 'published',
    publishedAt: new Date('2026-07-01'),
    views: 256,
  },
  {
    title: 'How Faith-Based Products Are Changing the Conversation',
    content: `<p>Faith-based products have evolved far beyond the novelty items of decades past. Today's faith-inspired creations combine quality, style, and meaningful messages that spark genuine conversations.</p>
<h2>The New Wave of Faith Products</h2>
<p>Modern faith-based brands are creating products that people actually want to use — not because they're "Christian," but because they're well-designed and carry a message worth sharing. The quality speaks for itself.</p>
<h2>Living Your Faith Boldly</h2>
<p>There's something powerful about surrounding yourself with items that reflect your core values. They become conversation starters, quiet testimonies, and daily reminders of who you are and whose you are.</p>
<h2>Quality Over Quantity</h2>
<p>The best faith-based brands prioritize ethical manufacturing, sustainable materials, and designs that stand the test of time. At TK Concepts, every Rooted Identity piece is crafted with these principles in mind.</p>
<p>When you choose quality faith products, you're not just buying things — you're supporting a movement that puts purpose above profit.</p>`,
    excerpt: 'Faith-based products have evolved into a powerful form of expression. Learn how modern faith-inspired creations are making an impact.',
    category: 'culture',
    tags: ['faith', 'products', 'culture', 'identity'],
    readTime: 5,
    status: 'published',
    publishedAt: new Date('2026-07-05'),
    views: 198,
  },
  {
    title: 'Building a Daily Devotional Practice That Sticks',
    content: `<p>Starting a devotional habit is easy. Maintaining one is the real challenge. Here's how to build a daily devotional practice that becomes a natural part of your life.</p>
<h2>Why Consistency Matters</h2>
<p>Spiritual growth, like physical growth, happens through consistent, daily investment. You wouldn't go to the gym once and expect to be fit — the same principle applies to your spiritual life.</p>
<h2>Tips for Building the Habit</h2>
<ol>
<li><strong>Start with 5 minutes.</strong> Don't overwhelm yourself. Start small and build up.</li>
<li><strong>Same time, same place.</strong> Anchor your devotional time to an existing habit.</li>
<li><strong>Use a guide.</strong> A good devotional book provides structure and direction.</li>
<li><strong>Journal what you learn.</strong> Writing solidifies understanding.</li>
<li><strong>Pray through it.</strong> Let what you read inform your prayers.</li>
</ol>
<h2>Overcoming Common Obstacles</h2>
<p>The biggest enemy of consistency is perfectionism. Missed a day? Don't beat yourself up. Just pick up where you left off. God's grace covers your stumble.</p>
<p>Our 30-Day Purpose Devotional is designed to make this easy. Each day includes a scripture, a reflection, and an action step — everything you need in a focused 10-minute session.</p>`,
    excerpt: 'Consistency is the key to spiritual growth. Learn practical tips for building a daily devotional practice that lasts.',
    category: 'faith',
    tags: ['devotional', 'prayer', 'discipline', 'growth'],
    readTime: 6,
    status: 'published',
    publishedAt: new Date('2026-07-08'),
    views: 145,
  },
];

const seedBlog = async () => {
  try {
    await connectDB();

    const superAdmin = await User.findOne({ role: 'super_admin' });

    for (const postData of posts) {
      const existing = await BlogPost.findOne({ title: postData.title });
      if (existing) {
        console.log(`Skipping existing: ${postData.title}`);
        continue;
      }
      await BlogPost.create({
        ...postData,
        author: superAdmin?._id || null,
      });
      console.log(`Created: ${postData.title}`);
    }

    console.log('Blog seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Blog seed error:', error);
    process.exit(1);
  }
};

seedBlog();
