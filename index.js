const app = require('./app');

const port = process.env.PORT || 5000;


//  Router in test working server start
// app.get('/', (req, res) => {
//    res.status(200).json({
//        message: 'Working'
//    })
// });
//  Router in test working server end


app.listen(port, () => {
   console.log(`Server has been started on ${port}`);
});
