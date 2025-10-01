import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    // {
    // host: 'localhost',
    // dialect:'sqlite',
    // logging: false,
    // define:{
    //     timestamps: false,
    // },
    // storage: './data/barbutia.sqlite'
    // }
    process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true
    }
});

export default sequelize