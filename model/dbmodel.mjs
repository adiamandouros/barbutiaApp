import { DataTypes } from 'sequelize';
import sequelize from './config.mjs';

// DEFINE MODEL
const Match = sequelize.define(
    'Matches', {
    matchId:{
        type: DataTypes.UUID.V4,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey:true,
        autoIncrement:true
    },
    homeTeamName: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    awayTeamName: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE
    },
    place: {
        type: DataTypes.DATE
    },
    homeTeamScore: {
        type: DataTypes.TINYINT
    },
    awayTeamScore: {
        type: DataTypes.TINYINT
    },
    isHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    league: {
        type:DataTypes.TEXT,
        allowNull:false
    }
});

Match.beforeCreate(match => match.matchId = uuid())
// const Book = sequelize.define(
//     'Book', {
//     title: {
//         type: DataTypes.TEXT,
//         primaryKey: true,
//         unique: true
//     },
//     author: {
//         type: DataTypes.TEXT,
//         allowNull: false
//     },
// });

// const User = sequelize.define(
//     'User', {
//     name: {
//         type: DataTypes.TEXT,
//         primaryKey: true,
//     },
//     password: { type: DataTypes.TEXT },
// });

// const BookUser = sequelize.define('BookUser', {
//     comment: {
//         type: DataTypes.TEXT,
//     }
// });

// Book.belongsToMany(User, { through: BookUser })
// User.belongsToMany(Book, { through: BookUser })

try {
    await sequelize.createSchema('barbutia')
}
catch(error) {
    console.log(error.message)
}
await sequelize.sync({ alter: true }); // recreate all tables in the database if they don't exist or if they don't match the model, otherwise do nothing

export { Match }