import Book from "../models/BookModel/Book.js";

export const seedBooks = async (req, res) => {
  try {
    const books = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A classic American novel about wealth and love in the Jazz Age",
        genre: "Fiction",
        coverImage: "https://example.com/gatsby.jpg",
        pdfUrl: "https://example.com/gatsby.pdf",
        rentalPricePerDay: 2.99,
        pageCount: 180,
        publishedDate: "1925-04-10"
      },
      // ... more books
    ];

    await Book.insertMany(books);
    res.json({ message: "Books seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};