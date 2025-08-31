import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home, { ContentPage } from "./pages/Home";
import Pictor from "./pages/Pictor";
import { Helmet } from "react-helmet";
import Destroyer from "./destroyer/Destroyer";
import UserSetup from "./usersetup/UserSetup";
import Neowise from "./pages/NeoWise";
import SiteSmash from "./pages/SiteSmash";
import Luminet from "./pages/Luminet";
import ScavengePage from "./pages/SavengePage";
import TrainPage from "./pages/TrainPage";
import BookClubPage from "./pages/BookClubPage";
import { Provider } from "react-redux";
import store from "./store";
import BookList from "./bookclub/BookList";
import ThreadView from "./bookclub/ThreadView";
import BookView from "./bookclub/BookView";
import BookClubAdminPage from "./pages/BookClubAdminPage";
import AddThreadForm from "./bookclub/AddThreadForm";

export default function App() {
  const [homeContent, setHomeContent] = React.useState<ContentPage>(
    ContentPage.PROJECTS
  );
  const [message, setMessage] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [urlParameter, setUrlParameter] = React.useState(
    "https://example.com/"
  );
  const [coverLetter, setCoverLetter] = React.useState(null);
  const [jobTitle, setJobTitle] = React.useState("");

  return (
    <Provider store={store}>
      <Helmet>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-HC7CCHZVMP"
        ></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HC7CCHZVMP');
          `}
        </script>
      </Helmet>
      <BrowserRouter>
        <Destroyer />
        <UserSetup />
        <Routes>
          <Route
            index
            element={
              <Home
                content={homeContent}
                setContent={setHomeContent}
                message={message}
                setMessage={setMessage}
                company={company}
                setCompany={setCompany}
                urlParameter={urlParameter}
                setUrlParameter={setUrlParameter}
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
              />
            }
          />
          <Route path="pictor" element={<Pictor />} />
          <Route path="neowise" element={<Neowise />} />
          <Route path="screen" element={<SiteSmash />} />
          <Route path="luminet" element={<Luminet />} />
          <Route path="scavenge" element={<ScavengePage />} />
          <Route path="train-scavenge" element={<TrainPage />} />
          <Route path="bookclub/admin" element={<BookClubAdminPage />} />

          <Route path="bookclub" element={<BookClubPage />}>
            <Route index element={<BookList />} />
            <Route path=":bookId" element={<BookView />} />
            <Route path=":bookId/create" element={<AddThreadForm />} />
            <Route path=":bookId/:threadId" element={<ThreadView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
