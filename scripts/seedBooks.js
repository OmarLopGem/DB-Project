import mongoose from "mongoose";
import bookModel from "../model/book_model.js"; // AJUSTA si pones el archivo en otra carpeta

// ⬅️ TU CADENA DE CONEXIÓN A MONGO AQUÍ
const MONGO_URI = "mongodb+srv://j-omar:LOGjor1602@cluster0.rmdoztf.mongodb.net/NewPagesSystems_DB";

const books = [
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "editor": "Scribner",
        "year": 1925,
        "price": 10.99,
        "isbn": "9780743273565",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/fca8b269-1ece-4c35-ad41-cd98986c1f44/content?attachment=false",
        "stock": 25,
        "discount": 20,
        "synopsis": "A tragic romance set in the Jazz Age, following the mysterious millionaire Jay Gatsby and his obsession with Daisy Buchanan, exposing themes of illusion, wealth, and the American Dream."
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "editor": "Secker & Warburg",
        "year": 1949,
        "price": 14.99,
        "isbn": "9780451524935",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/0f3f5c44-4b43-4bb9-a112-362677dcace8/content?attachment=false",
        "stock": 30,
        "synopsis": "In a totalitarian society ruled by Big Brother, Winston Smith begins to question the oppressive regime. A powerful dystopian story about surveillance, truth manipulation, and loss of freedom."
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "editor": "J.B. Lippincott & Co.",
        "year": 1960,
        "price": 12.99,
        "isbn": "9780061120084",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/d0069239-36e9-49ab-a5bd-56ac379fa479/content?attachment=false",
        "stock": 18,
        "synopsis": "Through the eyes of young Scout Finch, the novel explores racial injustice and moral growth as her father, Atticus, defends a Black man falsely accused of a terrible crime."
    },
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "editor": "George Allen & Unwin",
        "year": 1937,
        "price": 17.99,
        "isbn": "9780547928227",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/992e22bd-7a6c-46b3-8745-22c65e8dbb7d/content?attachment=false",
        "stock": 40,
        "synopsis": "Bilbo Baggins, a reluctant hobbit, is swept into an adventure with dwarves and wizards to reclaim a lost treasure guarded by the dragon Smaug. A charming tale of bravery and discovery."
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "editor": "Little, Brown and Company",
        "year": 1951,
        "price": 11.99,
        "isbn": "9780316769488",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/63e3cd1f-c61e-4e88-a1a5-bce8c993ba99/content?attachment=false",
        "stock": 22,
        "synopsis": "Holden Caulfield narrates his rebellious journey through New York City as he struggles with identity, loneliness, and the transition to adulthood."
    },
    {
        "title": "The Alchemist",
        "author": "Paulo Coelho",
        "editor": "HarperTorch",
        "year": 1988,
        "price": 13.99,
        "isbn": "9780061122415",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/747a99ac-5932-429b-a727-79fe7f09f6bf/content?attachment=false",
        "stock": 35,
        "synopsis": "Santiago, a young shepherd, embarks on a journey to find his Personal Legend. A philosophical story about destiny, spirituality, and listening to your heart."
    },
    {
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "editor": "Harper",
        "year": 2011,
        "price": 19.99,
        "isbn": "9780062316097",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/a4ac187d-94cc-4f8b-b432-8aeedd34a0f0/content?attachment=false",
        "stock": 27,
        "synopsis": "Harari explores how Homo sapiens became the dominant species, examining history, biology, and culture in a thought-provoking overview of humanity."
    },
    {
        "title": "The Silent Patient",
        "author": "Alex Michaelides",
        "editor": "Celadon Books",
        "year": 2019,
        "price": 16.99,
        "isbn": "9781250301697",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/abd85ab3-ec44-4410-8021-2677876de59c/content?attachment=false",
        "stock": 29,
        "synopsis": "A psychological thriller about a woman who stops speaking after being accused of murdering her husband, and the psychotherapist determined to uncover her shocking secret."
    },
    {
        "title": "The Midnight Library",
        "author": "Matt Haig",
        "editor": "Canongate Books",
        "year": 2020,
        "price": 15.99,
        "isbn": "9780525559474",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/a52629d1-cd1f-46b0-a4c0-7ccfe76c0489/content?attachment=false",
        "stock": 33,
        "synopsis": "Nora Seed enters a magical library where every book represents a different version of her life. A reflective story about regret, choices, and finding meaning."
    },
    {
        "title": "Atomic Habits",
        "author": "James Clear",
        "editor": "Avery",
        "year": 2018,
        "price": 18.99,
        "isbn": "9780735211292",
        "cover": "https://quipa-pruebas-activos.atrums.com:9053/api/v1/operations/alfresco/nodes/f172c1e3-88dc-4ae3-8565-d2c1791ee8af/content?attachment=false",
        "stock": 50,
        "synopsis": "A practical guide on how tiny habits compound into remarkable results. Clear teaches how to build good habits, break bad ones, and master the small behaviors that lead to success."
    }
];


async function runSeed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        await bookModel.insertMany(books);
        console.log("Books inserted successfully!");

        process.exit();
    } catch (error) {
        console.error("Error inserting books:", error);
        process.exit(1);
    }
}

runSeed();
