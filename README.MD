Here's an improved version of your documentation with the added prerequisite section and a more polished structure:

---

# Personal Blog

**Personal Blog** is a simple and powerful Node.js application that allows users to create, manage, and share their own blog posts. Featuring cover image uploads, text formatting, and an easy-to-use interface, this project is ideal for anyone looking to write and share content on a variety of topics.

## Features

- Create and manage blog posts.
- Upload cover images to enhance posts.
- View blog posts without registration.
- Comment on posts using Disqus.
- Secure user registration and login with bcryptjs password encryption.

---

## Prerequisites

Before setting up the Personal Blog locally, ensure you have the following:

1. **Node.js**: Install Node.js from the [official website](https://nodejs.org).
2. **npm**: npm is installed with Node.js. Confirm installation with:
    ```bash
    npm --version
    ```
3. **MongoDB Atlas Account**:
    - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    - Create a **new cluster**.
    - Connect to your cluster and **retrieve the connection string**.
    - Replace the `<password>` and other placeholders in the connection string as needed.
4. **Git**: Install Git to clone the repository:
    ```bash
    git --version
    ```
5. **Code Editor**: Choose a code editor, such as Visual Studio Code or Sublime Text.

---

## Installation

Follow these steps to install and run Personal Blog locally:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/radlee/personal-blog.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd personal-blog
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Set up environment variables**:
    - Create a `.env` file in the project root directory.
    - Add your MongoDB connection string to the `.env` file:
      ```bash
      MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
      ```
    - Add any other environment variables, such as port number or session secrets.

5. **Start the server**:
    ```bash
    npm start
    ```

6. **Access the application**:
    Open your browser and navigate to [http://localhost:5000](http://localhost:5000) to view and use the blog.

---

## Usage

Once the server is running, you'll be greeted with the landing page displaying all available blog posts. Here’s how you can interact with the platform:

- **View Blog Posts**: Unregistered users can browse through blog posts, view post details, and leave comments via Disqus.
- **Register and Login**: Click the menu icon (three vertical lines) in the top left corner to find the registration and login options.
    - After registration, you’ll be able to create, edit, and delete your own blog posts.
    - Passwords are securely encrypted using `bcryptjs`.
- **Create Blog Posts**: Once logged in, you can add new blog posts by providing a title, content, and optional cover image.

---

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

---

## Credits

Special thanks to the following for their inspiration and guidance:

- **codeX**
- **Flash**
- **Friends and colleagues**
- **Net Ninja Pro - Raddy** for an excellent Node.js blog tutorial.

---

This version organizes information more clearly, adds essential prerequisites, and improves the overall flow.
