-- Seed Blog Posts
-- We attempt to assign the first found profile as the author. If no profile exists, author_id will be NULL (which schema allows).

WITH first_admin AS (
    SELECT id FROM profiles LIMIT 1
)
INSERT INTO posts (slug, title, excerpt, content, cover_image, is_published, published_at, author_id)
SELECT 
    'why-online-christian-education-vital',
    'Why Online Christian Education is Vital for the Modern Leader',
    'Discover how flexible, faith-based learning empowers you to serve effectively in a changing world without pausing your ministry.',
    '<p>In today''s rapidly changing world, the call to leadership requires more than just natural talent; it demands a deep spiritual grounding and a robust biblical worldview. For many called to ministry and marketplace leadership, the traditional path of pausing life to attend a seminary campus is neither feasible nor desirable. This is where <strong>online Christian education</strong> bridges the gap.</p>
    
    <h2>Flexibility for the Called</h2>
    <p>Scripture reminds us to "redeem the time" (Ephesians 5:16). Online learning allows you to pursue your degree without uprooting your family or leaving your current ministry assignment. At Landmark Christian University, our programs are designed to integrate seamlessly with your life, allowing you to study during early mornings, lunch breaks, or late evenings.</p>
    
    <h2>A Biblical Worldview in Every Subject</h2>
    <p>Whether you are studying Theology, Christian Counseling, or Business, your education should point you to Christ. Unlike secular institutions, LCU integrates faith into every curriculum. We believe that <em>all truth is God''s truth</em>, and our goal is to help you see your professional field through the lens of Scripture.</p>
    
    <h2>Global Connection</h2>
    <p>One of the unexpected blessings of online education is the diversity of the cohort. You will learn alongside peers from different continents, denominations, and cultural backgrounds. This global perspective enriches your understanding of the Great Commission and prepares you for ministry in a connected world.</p>
    
    <p><strong>Ready to take the next step?</strong> Explore our <a href="/programs">degree programs</a> today and see how LCU can equip you for your calling.</p>',
    '/hero-students.png',
    true,
    NOW() - INTERVAL '2 days',
    (SELECT id FROM first_admin)

WHERE NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'why-online-christian-education-vital');

WITH first_admin AS (
    SELECT id FROM profiles LIMIT 1
)
INSERT INTO posts (slug, title, excerpt, content, cover_image, is_published, published_at, author_id)
SELECT 
    'balancing-ministry-family-and-studies',
    'Balancing Ministry, Family, and Studies: A Guide for Students',
    'Practical tips for managing your time and spiritual health while pursuing your degree at LCU.',
    '<p>Pursuing a degree while balancing family responsibilities and ministry commitments is a holy challenge. It requires discipline, grace, and reliance on the Holy Spirit. Here are some practical strategies from our most successful students.</p>
    
    <h2>1. Prioritize Your Devotional Life</h2>
    <p>It is easy to let academic study replace personal time with God. Remember, you cannot pour from an empty cup. Make your first appointment of the day with the Lord. As Martin Luther once said, "I have so much to do that I shall spend the first three hours in prayer."</p>
    
    <h2>2. Create a Dedicated Study Space</h2>
    <p>Consistency is key. Designate a specific corner of your home for study. When you sit there, your brain knows it is time to focus. Let your family know that when you are in your "study zone," you are working on your future.</p>
    
    <h2>3. Integrate Learning with Ministry</h2>
    <p>Don''t compartmentalize your education. Use what you learn in class immediately in your ministry. if you are studying <em>Biblical Leadership</em>, practice those principles in your next church board meeting. This not only reinforces your learning but blesses those you serve.</p>
    
    <h2>4. Give Yourself Grace</h2>
    <p>There will be weeks when life happens. A child gets sick, a work deadline looms, or ministry demands spike. LCU''s flexible format is built for this. Communicate with your professors and remember that this journey is a marathon, not a sprint.</p>',
    '/university-campus-with-cross-and-students.jpg',
    true,
    NOW() - INTERVAL '5 days',
    (SELECT id FROM first_admin)

WHERE NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'balancing-ministry-family-and-studies');

WITH first_admin AS (
    SELECT id FROM profiles LIMIT 1
)
INSERT INTO posts (slug, title, excerpt, content, cover_image, is_published, published_at, author_id)
SELECT 
    'lcu-achieves-new-accreditation-milestone',
    'LCU Achieves New Accreditation Milestone',
    'Landmark Christian University achieves new milestone in academic excellence and global recognition.',
    '<p>We are thrilled to announce that Landmark Christian University has reached a significant milestone in our journey of academic excellence. This achievement serves as a testament to the hard work of our faculty, the dedication of our students, and our unwavering commitment to providing high-quality, biblically-centered education.</p>
    
    <h2>What This Means for You</h2>
    <p>Accreditation is more than just a seal of approval; it is an assurance of quality. For our students and alumni, this means:</p>
    <ul>
        <li><strong>Credits Transferability:</strong> Easier transfer of credits to other recognized institutions.</li>
        <li><strong>Degree Recognition:</strong> Enhanced recognition of your degree by employers, ministry organizations, and other universities.</li>
        <li><strong>Continuous Improvement:</strong> A commitment to regularly reviewing and improving our programs to meet rigorous standards.</li>
    </ul>
    
    <h2>A Word from the President</h2>
    <p>"This milestone is not just about academic rigor; it is about stewardship. We are stewarding the callings of thousands of students, ensuring they receive the best possible preparation for their Kingdom assignment. To God be the glory!"</p>
    
    <p>We invite you to celebrate with us. As we look to the future, we remain dedicated to our mission: <strong>Empowering Kingdom Leaders for Global Impact.</strong></p>',
    '/graduate-student.png',
    true,
    NOW() - INTERVAL '10 days',
    (SELECT id FROM first_admin)

WHERE NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'lcu-achieves-new-accreditation-milestone');
