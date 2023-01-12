const { timeStamp, count } = require('console');
const express = require('express') 
const cors = require('cors')
//database
const { default: mongoose } = require('mongoose');
const DATABASE = "mongodb+srv://reservation:<PASSWORD>@cluster0.jzuwisp.mongodb.net/reservation?retryWrites=true&w=majority";
const DB_PASS = "reservation"
const PORT = 3000


const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const DB = DATABASE.replace(
    '<PASSWORD>',
    DB_PASS
);

mongoose.set("strictQuery", false);
mongoose.connect(DB, { 
    useNewUrlParser: true, 
    useNewUrlParser: true,
    useUnifiedTopology: true, 
}).then(con => {
    console.log('Databse connection successfull!');
});

const userSchema = new mongoose.Schema({
    id: String,
    
    name: {
        type: String,
        required: [true, 'User name can not be empty!'],
    },
    email: {
        type: String,
        required: [true, 'Email can not be empty!'],
    },
    role: String,
    package: {
        type: String,
    },
});

const reservationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Reservation title can not be empty!']
    },
    user_id: {
        type: String,
    },
    user_name: {
        type: String,
        required: [true, 'User name can not be empty!'],
    },
    package: {
        type: String,
        required: [true, 'Package can not be empty!'],
    },
    request_date: {
        type: Date,
        required: [true, 'Request date can not be empty!'],
    },
    status: {
        type: String,
        required: [true, 'Status can not be empty!']
    },
    created_at: {
        type: Date,
    }
});








//user model
const User = mongoose.model('User', userSchema);

const Reservation = mongoose.model('Reservation', reservationSchema);

// add new user
app.post('/api/v1/users', (req, res) => {
    console.log(req.body);
    const user = new User({
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        package: req.body.package
    });
    
    user.save((error) => {
        if (error) return res.status(500).send(error.message);
        return res.status(201).send(user);
    });
});

// get all users
app.get('/api/v1/users', (req, res) => {
    User.find((error, users) => {
        if (error) return res.status(500).send(error);
        return res.send(users);
    });
});


// get user by id

app.get('/api/v1/users/:id', (req, res) => {
    User.find({id: req.params.id}, (error, user) => {
      if (error) return res.status(500).send(error);
      if (user.length == 0) return res.status(404).send('User not found');
      return res.send(user[0]);
    });
});

// get all reservation 
app.get('/api/v1/users/reservations/:id', (req, res) => {
    Reservation.find({user_id: req.params.id}, (error, reservations) => {
        if (error) return res.status(500).send(error);
        return res.send(reservations);
    });
});

// get all accepted reservation 
app.get('/api/v1/users/reservations/accepted/:id', (req, res) => {
    Reservation.find({user_id: req.params.id, status: 'Accepted'}, (error, reservations) => {
        if (error) return res.status(500).send(error);
        return res.send(reservations);
    });
});

//update user
app.put('/api/v1/users/:id', (req, res) => {
    User.findOneAndUpdate({id: req.params.id}, req.body, { new: true }, (error, user) => {
      if (error) return res.status(500).send(error.message);
      if (!user) return res.status(404).send('User not found');
      return res.send(user);
    });
});

app.delete('/api/v1/users/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id, (error) => {
        if(error) return res.status(500).send(error.message)
        if(!error) return res.status(200).send('User delete successfull!')
    })
})





// add new reservation
app.post('/api/v1/reservations', (req, res) => {
    const reservation = new Reservation({
        user_id: req.body.user_id,
        title: req.body.title,
        user_name: req.body.name,
        package: req.body.package,
        status: req.body.status,
        request_date: req.body.request_date,
        created_at: Date.now(),
    })
    
    reservation.save((error) => {
        if (error) return res.status(500).send(error.message);
        return res.status(201).send(reservation);
    });
});


// get all users
app.get('/api/v1/reservations', (req, res) => {
    Reservation.find((error, reservations) => {
        if (error) return res.status(500).send(error);
        return res.send(reservations);
    });
});


// get user by id
app.get('/api/v1/reservations/:id', (req, res) => {
    Reservation.findById(req.params.id, (error, user) => {
      if (error) return res.status(500).send(error);
      if (!user) return res.status(404).send('User not found');
      return res.send(user);
    });
});

//accept reservation
app.put('/api/v1/reservations/accept/:id', (req, res) => {
    Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true }, (error, reservation) => {
      if (error) return res.status(500).send(error.message);
      if (!reservation) return res.status(404).send('Reservation not found');
      return res.status(200).send(reservation);
    });
});

//reject reservation
app.put('/api/v1/reservations/reject/:id', (req, res) => {
    Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true }, (error, reservation) => {
      if (error) return res.status(500).send(error.message);
      if (!reservation) return res.status(404).send('Reservation not found');
      return res.status(200).send(reservation);
    });
});

app.delete('/api/v1/reservations/:id', (req, res) => {
    Reservation.findByIdAndDelete(req.params.id, (error) => {
        if(error) return res.status(500).send(error.message)
        if(!error) return res.status(200).send('User delete successfull!')
    })
})

app.get('/api/v1/reservations/status/:status', (req, res) => {
    Reservation.find({status: req.params.status}, (error, reservation) => {
        if(error) return res.status(500).send('Something went wrong!')
        res.status(200).send(reservation)
    })
})

app.get('/api/v1/reservations/accpeted/capacity', (req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 
    Reservation.aggregate([
        {
            $match: {
                request_date: {
                    $gte: today
                }
            }
        },
        {
          $group: {
            _id: '$request_date',
            count: { $sum: 1 },
          }
        },
        {
            $project: {
              _id: '$_id',
              capacity: { $subtract: [500, 0] },
              booked: '$count',
              available: { $subtract: [500, "$count"] }
            }
          }
      ], (err, results) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(results);
        }
      });
})


app.get('/api/v1/reservations/accpet/aviability/:date', (req, res) => {
    const today = new Date(req.params.date);
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
    Reservation.aggregate([
        {
            $match: {
                request_date: {
                    $gte: today,
                    $lt: tomorrow
                }
            }
        },
        {
          $group: {
            _id: '$request_date',
            count: { $sum: 1 },
          }
        },
        {
            $project: {
              _id: '$_id',
              capacity: { $subtract: [500, 0] },
              booked: '$count',
              available: { $subtract: [500, "$count"] }
            }
        },
      ], (err, results) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(results[0]);
        }
      });
})


app.get('/api/v1/reservations/request/aviability/:id', (req, res) => {
    const currentMonth = new Date();
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0);
    Reservation.aggregate([
        {
            $match: {
                request_date: {
                    $gte: currentMonthStart,
                    $lt: currentMonthEnd
                },
            }
        },
        {
            $match: {
                status: 'Accepted',
                user_id: req.params.id,
            }
        },
        {
          $group: {
            _id: '$user_id',
            count: { $sum: 1 },
          }
        },
      ], (err, results) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(results[0]);
        }
      });
})



app.listen(PORT, () => {
    console.log(process.env.PORT)
    console.log(`Server is running on port: ${PORT}`);
});










  