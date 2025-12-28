const sequelize = require('../src/config/db.mysql');
const { QueryTypes } = require('sequelize');

async function addAvatarToResidents() {
  try {
    console.log('🔄 Checking existing columns in residents table...');

    // Check if column exists
    const [columns] = await sequelize.query('SHOW COLUMNS FROM residents LIKE "avatar"');

    if (columns.length === 0) {
      console.log('➕ Adding avatar column to residents table...');
      await sequelize.query('ALTER TABLE residents ADD COLUMN avatar VARCHAR(255) DEFAULT NULL COMMENT "头像路径" AFTER address');
      console.log('✅ Column added successfully');
    } else {
      console.log('ℹ️ Column already exists');
    }

    console.log('🔄 Updating resident avatars...');

    // Get all residents
    const residents = await sequelize.query('SELECT id, avatar FROM residents', {
      type: QueryTypes.SELECT
    });

    console.log(`Found ${residents.length} residents.`);

    // Avatar list
    const avatarList = [
      '/uploads/avatars/avatars_1.jpg',
      '/uploads/avatars/avatars_2.jpg',
      '/uploads/avatars/avatars_3.jpg',
      '/uploads/avatars/avatars_4.jpg',
      '/uploads/avatars/avatars_5.jpg',
      '/uploads/avatars/avatars_6.jpg'
    ];

    let updateCount = 0;
    for (const resident of residents) {
      if (!resident.avatar) {
        // Randomly assign one of the 6 avatars
        const avatarIndex = (resident.id - 1) % 6; // Use modulo to distribute evenly
        const avatar = avatarList[avatarIndex];

        await sequelize.query('UPDATE residents SET avatar = ? WHERE id = ?', {
          replacements: [avatar, resident.id],
          type: QueryTypes.UPDATE
        });
        updateCount++;
      }
    }

    console.log(`✅ Updated ${updateCount} residents with avatars.`);
    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

addAvatarToResidents();
