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
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    teamName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    teamLogo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    league: {
        type:DataTypes.STRING(100),
        allowNull:false
    },
    date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    place: DataTypes.STRING(100),
    homeTeamScore: DataTypes.TINYINT,
    awayTeamScore: DataTypes.TINYINT,
    isWin: DataTypes.BOOLEAN,
    isHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    article: DataTypes.STRING(100),
    }, { indexes: [
        {
            unique: true,
            fields: ['teamName', 'league', 'date', 'isHome']
        }]
    }
);

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

const Standings = sequelize.define(
    'Standings', {
    position: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    teamName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true
    },
    teamLogo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    points: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    gamesPlayed: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    wins: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    losses: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    pointsFor: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    pointsAgainst: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    pointsDiff: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
});

const Players = sequelize.define(
    'Players', {
    jersey: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Δήμος'
    },
    surname: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Κουτσόγεωργας'
    },
    basketakiName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true
    },
    nickname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'legend'
    },
    matches: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    mvpAwards: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    points: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    pointsAvg: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 0
    },
    rebounds: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    reboundsAvg: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 0
    },
    assists: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    assistsAvg: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 0
    },
    steals: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    stealsAvg: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 0
    },
    blocks: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    blocksAvg: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 0
    },
    turnovers: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    turnoversAvg: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 0
    },
    freeThrowsPercentage: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0
    },
    twoPointsPercentage: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0
    },
    threePointsPercentage: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0
    }
});

const PlayerStats = sequelize.define('PlayerStats', {
  points: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 0
  },
  rebounds: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 0
  },
  assists: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 0
  },
  freeThrowsPercentage: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    defaultValue: 0
  },
  twoPointsPercentage: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    defaultValue: 0
  },
  threePointsPercentage: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    defaultValue: 0
  }
});

FutureMatch.belongsTo(Court, { foreignKey: 'place', targetKey: 'basketakiName' })
NextMatch.belongsTo(Court, { foreignKey: 'place', targetKey: 'basketakiName' })
Court.hasMany(FutureMatch, { foreignKey: 'place', sourceKey: 'basketakiName' })
Court.hasMany(NextMatch, { foreignKey: 'place', sourceKey: 'basketakiName' })
Players.belongsToMany(CompletedMatch, { through: PlayerStats });
CompletedMatch.belongsToMany(Players, { through: PlayerStats });

await sequelize.sync();

export { FutureMatch, CompletedMatch, NextMatch, Court, Standings, Players, PlayerStats }