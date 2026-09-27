"use strict";

module.exports = {
  
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
  `INSERT INTO people (
     id, first_name, last_name, email, created_at, updated_at
   )
   SELECT u.id, 'PENDIENTE', 'PENDIENTE', u.email, NOW(), NOW()
   FROM users AS u
   WHERE u.person_id IS NULL AND u.google_id IS NOT NULL
   ON CONFLICT (id) DO NOTHING`,
  { transaction },
);

      await queryInterface.sequelize.query(
        `UPDATE users AS u
         SET person_id = p.id
         FROM people AS p
         WHERE u.person_id IS NULL
           AND u.google_id IS NOT NULL
           AND p.id = u.id`,
        { transaction },
      );

      const [remaining] = await queryInterface.sequelize.query(
        `SELECT COUNT(*)::integer AS count
         FROM users
         WHERE person_id IS NULL AND google_id IS NOT NULL`,
        { type: Sequelize.QueryTypes.SELECT, transaction },
      );

      if (remaining.count !== 0) {
        throw new Error(
          `Could not link ${remaining.count} Google users to people`,
        );
      }
    });
  },

  async down() {},
};