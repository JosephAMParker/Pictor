import * as React from "react";

const BookClubAdmin: React.FC = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>BookClub Admin</h2>
      <p>
        <a
          href="http://localhost:5000/bookclub/admin/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Flask Admin Dashboard
        </a>
      </p>
    </div>
  );
};

export default BookClubAdmin;
