import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true
    },
    pool: {
        max: 10,   // max connections in pool
        min: 2,    // keep 2 warm connections ready
        acquire: 30000,
        idle: 10000
    }
});

export default sequelize