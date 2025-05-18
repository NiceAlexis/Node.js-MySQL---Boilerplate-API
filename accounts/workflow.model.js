module.exports = (sequelize, DataTypes) => {
    const Workflow = sequelize.define('Workflow', {
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Pending'
        }
    });

    return Workflow;
};
