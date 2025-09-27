import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    host: 'localhost',
    dialect:'sqlite',
    logging: false,
    define:{
        timestamps: false,
    },
    storage: './data/barbutia.sqlite'
    }

    // process.env.DATABASE_URL,
    // {
    //     dialect:'mysql',
    //     database: 'barbutia',
    //     user: 'baruser',
    //     password: 'sasgamanetabarbutia',
    //     host:'localhost',
    //     port:'3306',
    //     logging: false,
    //     define:{
    //                 timestamps: false,
    //                 freezeTableName: true
    //             },
    //     dialectOptions: {
    //         ssl:{
    //             require:true,
    //             rejectUnauthorized: false
    //         }
    //     }
    // }
    );

export default sequelize