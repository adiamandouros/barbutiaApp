import { DataTypes } from 'sequelize';
import sequelize from './config.mjs';

// DEFINE MODEL
const FutureMatch = sequelize.define(
    'FutureGames', {
    teamName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true
    },
    teamLogo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    league: {
        type:DataTypes.STRING(100),
        allowNull:false,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATE
    },
    place: {
        type: DataTypes.STRING(100)
    },
    isHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        primaryKey: true
    }
});

const CompletedMatch = sequelize.define(
    'CompletedGames', {
    teamName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true
    },
    teamLogo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    league: {
        type:DataTypes.STRING(100),
        allowNull:false,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATE,
        primaryKey: true
    },
    place: {
        type: DataTypes.STRING(100)
    },
    homeTeamScore: {
        type: DataTypes.TINYINT
    },
    awayTeamScore: {
        type: DataTypes.TINYINT
    },
    isWin: {
        type: DataTypes.BOOLEAN,
    },
    isHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        primaryKey: true
    },
    article: {
        type: DataTypes.STRING(100),  //link to article about the match
    }
});

const Court = sequelize.define(
    'Courts', {
    basketakiName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    link: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    googleMapsName: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
});

const NextMatch = sequelize.define(
    'NextMatch', {
    teamName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true
    },
    teamLogo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    league: {
        type:DataTypes.STRING(100),
        allowNull:false,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATE
    },
    place: {
        type: DataTypes.STRING(100)
    },
    isHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        primaryKey: true
    }
});

FutureMatch.belongsTo(Court, { foreignKey: 'place', targetKey: 'basketakiName' })
NextMatch.belongsTo(Court, { foreignKey: 'place', targetKey: 'basketakiName' })
Court.hasMany(FutureMatch, { foreignKey: 'place', sourceKey: 'basketakiName' })
Court.hasMany(NextMatch, { foreignKey: 'place', sourceKey: 'basketakiName' })

// try {
//     await sequelize.createSchema('barbutia')
// }
// catch(error) {
//     console.log(error.message)
// }
// await sequelize.sync({ alter: true }); // recreate all tables in the database if they don't exist or if they don't match the model, otherwise do nothing
await sequelize.sync();

export { FutureMatch, CompletedMatch, NextMatch, Court }