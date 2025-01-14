var express=require('express');
var path = require('path');
const { MongoClient } = require("mongodb");
var app=express();
const uri="mongodb://127.0.0.1:27017/myDB";
const client= new MongoClient(uri);
let db, myCollection;
async function connectToDatabase() {
  try 
  { await client.connect();
    console.log("Connected to the database!");
    db = client.db('myDB');
    myCollection = db.collection('myCollection'); 
  } catch (err)  { console.error("there is an connecting to the database:-", err); }
}
connectToDatabase();

const cities= [ { name: 'Paris', image: '/paris.png', link: '/paris' }, { name: 'Rome', image: '/rome.png', link:'/rome' }, { name: 'Bali', image: '/bali.png', link: '/bali' },
 ];
const islands= [
  { name: 'Santorini', image: '/santorini.png', link: '/santorini' }, { name: 'Bali', image: '/bali.png', link:'/bali' },
 
];
const hiking= [
  { name: 'Inca', image: '/inca.png', link:'/inca' },{ name: 'Annapurna', image: '/annapurna.png', link: '/annapurna' },
  ];

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
const session = require('express-session');
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));
app.get('/home', (req, res)   => 
  { res.render('home', { errorMessage: null, successMessage: null });
});

app.get('/login', (req, res)    =>
  
  { const from = req.query.from; 
  if (from === 'registration')
         {  res.render('login', { errorMessage: null, successMessage: "Registration completed successfully! Please login." });
  }
  else {res.render('login', { errorMessage: null, successMessage: null });
      }
});

app.get ('/', (req, res)   => 
     {res.render('login', { errorMessage: null, successMessage: null });
        });

app.get('/registration', (req, res) => { res.render('registration', { errorMessage: null, successMessage: null });
    });
app.post('/register', async (req, res) => {const { username, password } = req.body;

  try 
  { const userExists = await myCollection.findOne({ username });

    if (!username || !password) 
          {  return res.render('registration', { errorMessage: "Please provide both username and password.", successMessage: null });
    }

    if (userExists) {return res.render('registration', { errorMessage: "Username already exists. Please choose another.",  successMessage: null });
    }

    await myCollection.insertOne({ username, password });
    return res.redirect('/login?from=registration');
  } 
  catch (err) 
  {
    console.error("Error occurred during registration:-", err);
    res.status(500).send("an error has  occurred during registration");
  }

});
app.post('/login', async (req, res) =>{const{username, password } = req.body;
  try { const userExists = await myCollection.findOne({username});
 if (!username || !password) {
        return res.render('login', { errorMessage: "Please provide both username and password.", successMessage: null });  }
      else 
      { if (userExists && userExists.password === password) 
             {
          req.session.username = username;
          return res.redirect('home');
        } 
        
        else { return res.render('login', { errorMessage: "Invalid username or password.", successMessage: null });
        } 
      }
  } 
  catch (err) 
  {
      console.error("Error during login:-", err);
      return res.status(500).send("An error occurred during login.");
  }
});

app.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await myCollection.findOne({ username });

    if (!username || !password) 
      {
        return res.render('login', { errorMessage: "Please provide both username and password.", successMessage: null });
    }
    else {
      if (userExists && userExists.password === password) {
        req.session.username = username;
           return res.redirect('home');
      } 
      
      else {
        return res.render('login', { errorMessage: "Invalid username or password.", successMessage: null });
            } 
    }
    
  } 
  catch (err) {
      console.error("Error during login:", err);
      return res.status(500).send("An error occurred during login.");
  }
});
app.get('/cities', (req, res) => 
  { res.render('cities');});

app.get('/islands', (req, res) => 
  { res.render('islands');});

app.get('/hiking', (req, res) => 
  {  res.render('hiking');});

app.get('/bali', (req, res) =>
         { res.render('bali', { errorMessage: null, successMessage: null });});

app.get('/inca', (req, res) =>  {
 
 
 
      res.render('inca', { errorMessage: null, successMessage: null });
});

app.get('/santorini', (req, res) =>
   {
  res.render('santorini', { errorMessage: null, successMessage: null });
       });

app.get('/rome', (req, res) => 
  {
  res.render('rome', { errorMessage: null, successMessage: null });
                      });
app.get('/paris', (req, res) => 
  {
  res.render('paris', { errorMessage: null, successMessage: null });
         });
app.get('/annapurna', (req, res) => 
  {
  res.render('annapurna', { errorMessage: null, successMessage: null });
});
app.get('/wanttogo', async (req, res) => 
  {
  const username = req.session.username;

  if (!username)
     {
    return res.status(403).send("User not logged in."); 
  }

  try {
    const userDoc = await myCollection.findOne({ username });

    if (!userDoc || !userDoc.wantToGoList)
        {
      return res.render('wanttogo', { wantToGoList: [], errorMessage: 'No places in the Want-to-Go list.' });
             }

    res.render('wanttogo', { wantToGoList: userDoc.wantToGoList, errorMessage: null });
  } 
  catch (err) 
     { console.error("Error retrieving the want-to-go list:", err);
    return res.status(500).send("An error has occurred.");
  }
         });
app.post('/rome', async (req, res) => 
      {
  const username = req.session.username;
  const cityName = "Rome";  
  if (!username) {
    return res.status(403).send("User not logged in"); 
  }

  try {
    const userDoc = await myCollection.findOne({ username });

    if (!userDoc) 
      
      {
      return res.status(404).send("User not found.");
    }

    if (!userDoc.wantToGoList) 
            {
      userDoc.wantToGoList = [];
      }

    if (userDoc.wantToGoList.includes(cityName)) 
      
      {
      return res.render('rome', { errorMessage: "This city already exists in the want to go list", successMessage: null });  
    }

    await myCollection.updateOne(
      { username },
      { $addToSet: { wantToGoList: cityName } }  
    );

    res.render('rome', { errorMessage: null, successMessage: "The city is added successfully" }); 
  } 
  catch (err) 
  {
    console.error("Error adding to want-to-go list:", err);
    return res.status(500).send("An error occurred.");
      }
});
app.post('/paris', async (req, res) => {
  const username = req.session.username;
  const cityName = "Paris";  
  if (!username)
        {
    return res.status(403).send("User not logged in"); 
  }

  try {
    const userDoc = await myCollection.findOne({ username });

    if (!userDoc) 
         {
            return res.status(404).send("User not found");
    }

    if (!userDoc.wantToGoList) 
      {
      userDoc.wantToGoList = [];
    }

    if (userDoc.wantToGoList.includes(cityName)) 
        {
      return res.render('paris', { errorMessage: "This city already exists in your want to go list", successMessage: null }); 
    }

    await myCollection.updateOne(
      { username },
      { $addToSet: { wantToGoList: cityName } } 
    );

    res.render('paris', { errorMessage: null, successMessage: "The city is added successfully" }); 
  } 
  catch (err) 
  
  
  {
      console.error("Error adding to your want-to-go list:", err);
    return res.status(500).send("An error has occurred.");
  }
});
app.post('/bali', async (req, res) => 
  {
  const islandName = "Bali";  
  const username = req.session.username;

        if (!username) 
          {
    return res.status(403).send("User not logged in"); 
  }

  try {
    const userDoc = await myCollection.findOne({ username });

       if (!userDoc) 
        {
      return res.status(404).send("User is not found");
       }

    if (!userDoc.wantToGoList) 
      {
           userDoc.wantToGoList = [];
            }

    if (userDoc.wantToGoList.includes(islandName))
       {
      return res.render('bali', { errorMessage: "This island already exists in your the want to go list", successMessage: null });
          }

    await myCollection.updateOne(
      { username },
      { $addToSet: { wantToGoList: islandName } }  
    );

    res.render('bali', { errorMessage: null, successMessage: "The island has been added successfully" }); 
  } 
  catch (err) {
    console.error("Error adding to your want-to-go list:", err);
    return res.status(500).send("An error occurred.");
  }
});
app.post('/santorini', async (req, res) => 
  {
  const islandName = "Santorini";
  const username = req.session.username;
  
  if (!username) {
    return res.status(403).send("User not logged in"); 
  }

  try {
    const userDoc = await myCollection.findOne({ username });

    if (!userDoc) 
      {
      return res.status(404).send("User is not found");
        }

    if (!userDoc.wantToGoList) 
      {
      userDoc.wantToGoList = [];
    }

    if (userDoc.wantToGoList.includes(islandName)) 
      {
      return res.render('santorini', { errorMessage: "This island already exists in your want to go list", successMessage: null }); 
             }

    await myCollection.updateOne(
      { username },
      { $addToSet: { wantToGoList: islandName } }  
    );

    res.render('santorini', { errorMessage: null, successMessage: "The island has been  added successfully" }); 
  } 
  catch (err) 
  {
    console.error("Error adding to your want-to-go list:" , err);
   
   
    return res.status(500).send("An error occurred");
  }
});
app.post('/inca', async (req, res) => 
  {
  const username =   req.session.username;
  const hikingName = "Inca";  
  if (!username) 
    {
    return res.status(403).send("User not logged in."); 
     }

  try {
    const userDoc = await myCollection.findOne({ username });

    if (!userDoc)
       {
      return res.status(404).send("User not found.");
    }

    if (!userDoc.wantToGoList) {
      userDoc.wantToGoList = [];
        }

    if (userDoc.wantToGoList.includes(hikingName)) 
      {
      return res.render('inca', { errorMessage: "This hiking already exists in the want to go list", successMessage: null });  
                                   }

    await myCollection.updateOne(
        { username },
      { $addToSet: { wantToGoList: hikingName } } 
    );

       res.render('inca', { errorMessage: null, successMessage: "The hiking is added successfully" }); 
  } 
  catch (err) {
    console.error("Error adding to your want-to-go list:", err);
     return res.status(500).send("An error occurred");
  }
});

app.post('/search',   (req, res) =>
  
  {
  const searchKeyword = req.body.Search.trim().toLowerCase();

  const destinations = [...cities, ...islands, ...hiking];

  const results = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchKeyword)
  );

  res.render('searchResults', {
    results,
    searchKeyword,
    message: results.length === 0 ? "Destination not Found" : null
  });
});

app.post('/annapurna',async (req, res) => 
 
 
   {
  const username =   req.session.username;
  const hikingName = "Annapurna";  
  if   (!username) 
    
    {
      return res.status(403).send("User is not logged in."); 
  }

  try {
    const userDoc = await myCollection.findOne({ username });

    if (!userDoc) {
      return res.status(404).send("User not found.");
           }

    if (!userDoc.wantToGoList)
       {
      userDoc.wantToGoList = [];
      }

    if (userDoc.wantToGoList.includes(hikingName)) 
      {
      return res.render('annapurna', { errorMessage: "This hiking already exists in the want to go list", successMessage: null });  
                                 }

    await myCollection.updateOne
    (
      { username },
      { $addToSet: { wantToGoList: hikingName } }  
                          );

    res.render('annapurna', { errorMessage: null, successMessage: "The hiking is added successfully" }); 
  } 
  catch (err) {console.error ("Error adding to your want-to-go list:", err);
    return res.status(500).send("an error has occurred");
                  }
               });
app.listen  (4000, () =>
    { console.log(" http://localhost:4000");});
