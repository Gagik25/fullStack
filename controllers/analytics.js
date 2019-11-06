const Order = require('../models/Order');
const  moment = require('moment');
const errorHandler = require('../utils/errorHandler');
module.exports.overview = async (req, res) => {
    try {
        const allOrders = await Order.find({user: req.user._id}).sort({date: 1});
        const ordersMap = getOrdersMap(allOrders);
        const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYY')] || [];


        // Number orders yesterday
        const yesterdayOrdersNumber = yesterdayOrders.length;
        // Count Order
        const totalOrdersNumber = allOrders.length;
        // Count days all
        const  daysNumber = Object.keys(ordersMap).length;
        // Orders all days
        const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(0);
        // percentage for the number of orders
        const ordersPercent = (((yesterdayOrdersNumber / ordersPerDay) -1) * 100).toFixed(2);
        // total Gain
        const totalGain = calculatePrice(allOrders);
        // Gain days
        const gainPerDay = totalGain / daysNumber;
        // Gain yesterday
        const yesterdayGain = calculatePrice(yesterdayOrders);
        // percentage Gain
        const gainPercentage =(((yesterdayGain / gainPerDay) -1) * 100).toFixed(2);
        //  Gain comparison
        const compareGain = (yesterdayGain - gainPerDay).toFixed(2);
        //  comparison of the number of orders
        const compareNumber = (yesterdayOrdersNumber -ordersPerDay).toFixed(2);


        res.status(200).json({
            gain: {
                percent: Math.abs(+gainPercentage),
                compare: Math.abs(+compareGain),
                yesterday: +yesterdayGain,
                isHigher: +gainPercentage > 0
            },
            orders: {
                percent: Math.abs(+ordersPercent),
                compare: Math.abs(+compareNumber),
                yesterday: +yesterdayOrdersNumber,
                isHigher: +ordersPercent > 0
            }
        })
    } catch (e) {
        errorHandler(res, e);
    }
};




module.exports.analytics = async (req, res) => {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1});

        const ordersMap = getOrdersMap(allOrders);

        const average = +(calculatePrice(allOrders) / Object.keys(ordersMap).length).toFixed(2);

        const chart = Object.keys(ordersMap).map(label => {
            const gain = calculatePrice(ordersMap[label]);
            const order = ordersMap[label].length;
            return {label, order, gain}
        });

        res.status(200).json({average,chart})
    } catch (e) {
        errorHandler(res, e);
    }
};


function getOrdersMap(orders = []) {
    const daysOrders = {};
    orders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYYY');

        if (date === moment().format('DD.MM.YYYY')) {
            return
        }

        if (!daysOrders[date]) {
            daysOrders[date] = [];
        }

        daysOrders[date].push(order)
    });
    return daysOrders
}


function calculatePrice(orders = []) {
    return orders.reduce((total, order) => {
        const orderPrice = order.list.reduce((orderTotal, item) => {
            return orderTotal += item.cost * item.quantity
        }, 0);
        return total += orderPrice
    }, 0)
}
