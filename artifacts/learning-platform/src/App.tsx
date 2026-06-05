import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TestPortal from "@/pages/TestPortal";
import GetReady from "@/pages/GetReady";
import ExamArea from "@/pages/ExamArea";
import ReviewPage from "@/pages/ReviewPage";
import ResultsPage from "@/pages/ResultsPage";
import QuestionReview from "@/pages/QuestionReview";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import Materials from "@/pages/Materials";
import PastQuestions from "@/pages/PastQuestions";
import EndocrineIIPage from "@/pages/EndocrineIIPage";
import EndocrineIIPractice from "@/pages/EndocrineIIPractice";
import NeuroscienceIIPage from "@/pages/NeuroscienceIIPage";
import NeuroscienceIIPractice from "@/pages/NeuroscienceIIPractice";
import CardiovascularIIPage from "@/pages/CardiovascularIIPage";
import CardiovascularIIPractice from "@/pages/CardiovascularIIPractice";
import AdminNotices from "@/pages/AdminNotices";
import LoadAccount from "@/pages/LoadAccount";
import Entertainment from "@/pages/Entertainment";
import StudyPlan from "@/pages/StudyPlan";
import GroupResults from "@/pages/GroupResults";
import AlignItSetup from "@/pages/games/AlignItSetup";
import AlignItGame from "@/pages/games/AlignItGame";
import ChessSetup from "@/pages/games/ChessSetup";
import ChessGame from "@/pages/games/ChessGame";
import ClinicalCase from "@/pages/ClinicalCase";
import McqOfTheDay from "@/pages/McqOfTheDay";
import TheoryPortal from "@/pages/TheoryPortal";
import TheoryGetReady from "@/pages/TheoryGetReady";
import TheoryExamArea from "@/pages/TheoryExamArea";
import TheorySummary from "@/pages/TheorySummary";
import TheoryResults from "@/pages/TheoryResults";
import TheoryAnalysis from "@/pages/TheoryAnalysis";
import MyAccountBalance from "@/pages/MyAccountBalance";
import LoadVirtualAccount from "@/pages/LoadVirtualAccount";
import StudyNotes from "@/pages/StudyNotes";
import { SupportChat } from "@/components/SupportChat";
import { useLocation } from "wouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const CHAT_EXCLUDED_PATHS = ["/exam-area", "/get-ready", "/theory-exam-area", "/theory-get-ready"];

function Router() {
  const [location] = useLocation();
  const showChat = !CHAT_EXCLUDED_PATHS.some((p) => location.startsWith(p));

  return (
    <>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/test-portal" component={TestPortal} />
        <Route path="/get-ready" component={GetReady} />
        <Route path="/exam-area" component={ExamArea} />
        <Route path="/review" component={ReviewPage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/question-review" component={QuestionReview} />
        <Route path="/history" component={History} />
        <Route path="/settings" component={Settings} />
        <Route path="/materials" component={Materials} />
        <Route path="/past-questions/level-400/endocrine-ii/practice" component={EndocrineIIPractice} />
        <Route path="/past-questions/level-400/endocrine-ii" component={EndocrineIIPage} />
        <Route path="/past-questions/level-400/neuroscience-ii/practice" component={NeuroscienceIIPractice} />
        <Route path="/past-questions/level-400/neuroscience-ii" component={NeuroscienceIIPage} />
        <Route path="/past-questions/level-400/cardiovascular-ii/practice" component={CardiovascularIIPractice} />
        <Route path="/past-questions/level-400/cardiovascular-ii" component={CardiovascularIIPage} />
        <Route path="/past-questions" component={PastQuestions} />
        <Route path="/admin/notices" component={AdminNotices} />
        <Route path="/load-account" component={LoadAccount} />
        <Route path="/entertainment" component={Entertainment} />
        <Route path="/study-plan" component={StudyPlan} />
        <Route path="/group-results" component={GroupResults} />
        <Route path="/games/align-it" component={AlignItSetup} />
        <Route path="/games/align-it/play" component={AlignItGame} />
        <Route path="/games/chess" component={ChessSetup} />
        <Route path="/games/chess/play" component={ChessGame} />
        <Route path="/clinical-case" component={ClinicalCase} />
        <Route path="/mcq-of-the-day" component={McqOfTheDay} />
        <Route path="/theory-portal" component={TheoryPortal} />
        <Route path="/theory-get-ready" component={TheoryGetReady} />
        <Route path="/theory-exam-area" component={TheoryExamArea} />
        <Route path="/theory-summary" component={TheorySummary} />
        <Route path="/theory-results" component={TheoryResults} />
        <Route path="/theory-analysis" component={TheoryAnalysis} />
        <Route path="/my-account-balance" component={MyAccountBalance} />
        <Route path="/load-virtual-account" component={LoadVirtualAccount} />
        <Route path="/study-notes" component={StudyNotes} />
        <Route component={NotFound} />
      </Switch>
      {showChat && <SupportChat />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
