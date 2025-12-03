import mongoose from "mongoose";
import Book from "../models/BookModel/Book.js";
import "dotenv/config";

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
      "A classic American novel about wealth and love in the Jazz Age with beautiful prose and memorable characters.",
    genre: "Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1543002588-d83ceb44f656?w=300",
    pdfUrl: "https://example.com/gatsby.pdf",
    rentalPricePerDay: 2.99,
    pageCount: 180,
    publishedDate: "1925-04-10",
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description:
      "A gripping tale of racial injustice and childhood innocence in the American South during the 1930s.",
    genre: "Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/mockingbird.pdf",
    rentalPricePerDay: 2.99,
    pageCount: 324,
    publishedDate: "1960-07-11",
  },
  {
    title: "1984",
    author: "George Orwell",
    description:
      "A dystopian social science fiction novel set in a totalitarian state where surveillance and control are absolute.",
    genre: "Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/1984.pdf",
    rentalPricePerDay: 3.49,
    pageCount: 328,
    publishedDate: "1949-06-08",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description:
      "A romantic novel of manners featuring Elizabeth Bennet and Mr. Darcy in Regency England.",
    genre: "Romance",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/pride.pdf",
    rentalPricePerDay: 2.49,
    pageCount: 279,
    publishedDate: "1813-01-28",
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description:
      "An epic fantasy adventure following Bilbo Baggins as he embarks on an unexpected journey with dwarves and a wizard.",
    genre: "Fantasy",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/hobbit.pdf",
    rentalPricePerDay: 3.99,
    pageCount: 310,
    publishedDate: "1937-09-21",
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description:
      "A sweeping history of humankind from the Stone Age to the present, exploring how humans came to dominate the world.",
    genre: "Non-Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/sapiens.pdf",
    rentalPricePerDay: 4.49,
    pageCount: 464,
    publishedDate: "2011-09-01",
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    description:
      "A revolutionary look at evolution from the perspective of genes as the primary unit of selection.",
    genre: "Science",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/selfish.pdf",
    rentalPricePerDay: 3.99,
    pageCount: 224,
    publishedDate: "1976-08-01",
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description:
      "An exploration of black holes, the Big Bang, and the nature of space and time by one of the greatest physicists.",
    genre: "Science",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/time.pdf",
    rentalPricePerDay: 3.49,
    pageCount: 256,
    publishedDate: "1988-04-01",
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    description:
      "A fast-paced thriller involving art, history, and mystery as symbologist Robert Langdon uncovers ancient secrets.",
    genre: "Thriller",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/davinci.pdf",
    rentalPricePerDay: 3.99,
    pageCount: 689,
    publishedDate: "2003-03-18",
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description:
      "A coming-of-age novel following Holden Caulfield as he navigates adolescence and alienation in New York City.",
    genre: "Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/catcher.pdf",
    rentalPricePerDay: 2.99,
    pageCount: 277,
    publishedDate: "1951-07-16",
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about a woman who grows up in a survivalist family and later pursues education at the university level.",
    genre: "Biography",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/educated.pdf",
    rentalPricePerDay: 4.99,
    pageCount: 352,
    publishedDate: "2018-02-20",
  },
  {
    title: "Sherlock Holmes: A Study in Scarlet",
    author: "Arthur Conan Doyle",
    description:
      "The first appearance of the legendary detective Sherlock Holmes as he investigates a mysterious murder.",
    genre: "Mystery",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/sherlock.pdf",
    rentalPricePerDay: 1.99,
    pageCount: 266,
    publishedDate: "1887-11-01",
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    description:
      "A beautiful story set in Nazi Germany told by Death himself, following a girl who steals books and shares them.",
    genre: "Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/bookthief.pdf",
    rentalPricePerDay: 3.99,
    pageCount: 552,
    publishedDate: "2005-09-01",
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    description:
      "An exploration of the two systems of thought and how they influence decision-making and human behavior.",
    genre: "Non-Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/thinking.pdf",
    rentalPricePerDay: 4.99,
    pageCount: 499,
    publishedDate: "2011-10-25",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description:
      "An epic science fiction novel set on a desert planet with political intrigue, religion, and ecological themes.",
    genre: "Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/dune.pdf",
    rentalPricePerDay: 4.99,
    pageCount: 688,
    publishedDate: "1965-06-01",
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description:
      "A psychological thriller about a woman who shoots her husband five times and then never speaks again.",
    genre: "Thriller",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/silent.pdf",
    rentalPricePerDay: 3.99,
    pageCount: 336,
    publishedDate: "2019-02-05",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "A practical guide to building good habits, breaking bad ones, and mastering tiny behaviors that lead to remarkable results.",
    genre: "Non-Fiction",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=300",
    pdfUrl: "https://example.com/atomic.pdf",
    rentalPricePerDay: 4.49,
    pageCount: 320,
    publishedDate: "2018-10-16",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing books
    await Book.deleteMany({});
    console.log("🗑️  Cleared existing books");

    // Insert sample books
    const result = await Book.insertMany(sampleBooks);
    console.log(`✅ Seeded ${result.length} books successfully!`);

    // Disconnect
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
