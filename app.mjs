import express from 'express'
import path from 'path'
import { engine } from 'express-handlebars'
import { router } from './routes.mjs'

const app = express()

app.engine('hbs', engine({extname: ".hbs"}))
app.set('view engine', 'hbs')

app.use(express.static("content"))

app.use(
  '/content/imgs',
  express.static(path.join('content', 'imgs'), {
    maxAge: '1d',        // cache images for 1 day
    etag: true,           // allow conditional GET (ETag header)
    lastModified: true   // include Last-Modified header
    // immutable: true       // tells browser “won’t change until filename does”
  })
)

//middleware gia na diavazei to request body
app.use(express.urlencoded({extended: false}))

app.use("/", router)

app.use((req, res) => {
    res.redirect("/")
})

app.use((err, req, res, next) => {
    console.log(err.stack)
    res.render("error", { message: err.message })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log("App has started in port " + PORT))





// Example: Express static file config
app.use('/assets', express.static('public/assets', {
  maxAge: '30d',         // Cache for 30 days
  etag: true,            // Allow validation if the file changes
  lastModified: true
}));
