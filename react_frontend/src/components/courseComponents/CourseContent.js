import React, {useState, useEffect, useContext} from 'react';
import { useParams } from 'react-router-dom';
import { useCourseDetail } from './useCourseDetail';
import axios from 'axios';
import { UserContext } from '../../contexts/userContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const CourseContent = () => {
  const { courseId } = useParams();
  const { courseData, loading, error } = useCourseDetail(courseId);
  const [progress, setProgress] = useState({});
  const { user } = useContext(UserContext)
  const completionPercentage = courseData?.completion_percentage ?? 'Loading...';
  const courseName = courseData?.course_name ?? 'Loading...';
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (completionPercentage === 100) {
      setShowCongratsPopup(true);
      alert("Congratulations! You've completed all lessons.");
    }
  }, [completionPercentage]);

  const handleClosePopup = () => {
    setShowCongratsPopup(false);
  };

  const handleClaimCertificate = () => {
    axios.post(`http://localhost:8000/courses/certificate/${courseId}/`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('userToken')}`,// Use axios for request
      }
    })
    .then(response => {
      console.log("Certificate claimed", response.data);
      navigate(`/certificate/${courseId}/view/`, { state: { certificateData: response.data } });
      setShowCongratsPopup(false);
    })
    .catch(error => {
      console.error("Error claiming certificate:", error);
    });
  };

  console.log("Percentage: ", completionPercentage);

  const [completedLessons, setCompletedLessons] = useState({});

  const { quizId } = useParams();
  // const { quiz } = useContext(QuizDetail);

  // console.log("Quiz detail: ", quiz);

  // get the total number of lessons
//   const totalLessons = courseData.chapters_with_lessons.reduce((acc, curr) => acc + curr.lessons.length, 0);
//   console.log("Total lessons: ", totalLessons);
  const progressBarPercentage = completionPercentage;
  const totalProgress = Object.values(progress).reduce((acc, curr) => acc + curr, 0) / Object.keys(progress).length || 0;


  const HandleMarkAsRead = async (lessonId, chapterIndex, totalLessons) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/courses/courses/mark-lesson-as-complete/',
        { lesson_id: lessonId },
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('userToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        setCompletedLessons(prev => ({ ...prev, [lessonId]: true }));
        
        // Update progress for the chapter
        const chapterProgress = ((progress[chapterIndex] || 0) + 1) / totalLessons;
        setProgress(prev => ({
          ...prev,
          [chapterIndex]: chapterProgress
        }));
  
        console.log(response.data.message);
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading course details.</p>;

  


    courseData.chapters_with_lessons_and_quizzes.forEach(chapterWithLessonsAndQuizzes => {
      const chapterId = chapterWithLessonsAndQuizzes.chapter.id;
      console.log("Chapter ID:", chapterId);
    });

    // courseData.chapters_with_lessons_and_quizzes.forEach(chapter => {
    //   chapter.quizzes.forEach(quiz => {
    //     console.log(quiz.id); // This will log each quiz ID
    //   });
    // });

    // Function to find a quiz ID for a given chapter ID
    function getQuizIdForChapter(chapterId) {
      console.log("Requested chapterId:", chapterId); // Debug log
      let quizId = null;
      courseData.chapters_with_lessons_and_quizzes.forEach(chapter => {
        if (chapter.chapter_id === chapterId) {
          quizId = chapter.quizzes.length > 0 ? chapter.quizzes[0].id : null;
        }
      });
      console.log("Found quizId:", quizId); // Debug log
      console.log("Chapter ID: ", chapterId);
      return quizId;
    }
    

  return (
    <div className=" mx-auto p-4 text-cyan-950 dark:bg-gray-800 dark:text-gray-100 md:pl-[270px] md:m-0 lg:mx-auto  lg:h-[100vh] lg:px-[500px]">
      <h1 className="text-3xl font-bold mb-4 px-2">{courseData.course_name}</h1>
      {user.user_type === "Student" && (
      // <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-2">
      //   <div
      //     className="bg-blue-600 h-2.5 rounded-full"
      //     style={{ width: `${totalProgress * 100}%` }}
      //   ></div>
      // </div>
      <div className="relative bg-gray-200 rounded-xl h-4 dark:bg-gray-700">
        <div className={`absolute left-0 top-0 h-4 rounded-xl ${progressBarPercentage > 0 ? 'bg-yellow-400' : ''}`} style={{ width: `${Math.max(progressBarPercentage, 5)}%` }}>
          <span className='text-white font-semibold text-center w-full flex items-center justify-center h-full'>{progressBarPercentage}%</span>
        </div>
    </div>
      )}
      <p className='text-justify p-2 dark:text-gray-300'>{courseData.course_description}</p>
      <div className="mb-6">
        {/* <h2 className="text-2xl font-semibold mb-2">Chapters</h2> */}
        {courseData.chapters_with_lessons.map((chapter, index) => (
  <div key={index} className="border p-4 mb-4 rounded-lg">
    <h3 className="text-xl font-bold">{chapter.chapter.chapter_name}</h3>
    {/* Assuming `getQuizIdForChapter` is a function that returns the quiz ID for a given chapter ID */}
    <Link to={`/quiz-detail/${getQuizIdForChapter(quizId)}`} className="text-cyan-900 hover:text-yellow-400 underline hover:cursor-pointer">Take Quiz</Link>
    {/* <Link to={`/quiz/${quizId}`}>Go to Quiz</Link> */}
    <div className="mt-4">
      {chapter.lessons.map((lesson, lessonIndex) => (
        <div key={lesson.id} className="ml-4 mt-2">
          <h5 className="text-gray-800 font-semibold text-xl">{`Lesson ${lessonIndex + 1}: ${lesson.lesson_name}`}</h5>
          <p className="text-gray-700  dark:text-gray-300">{lesson.lesson_content}</p>
          <p className='my-2 text-yellow-500'>Video: {lesson.video}</p>
          {user.user_type === "Student" && !completedLessons[lesson.id] && (
                      <button 
                        onClick={() => HandleMarkAsRead(lesson.id, index, chapter.lessons.length)} 
                        className='bg-cyan-950 text-gray-200 rounded hover:bg-yellow-500 p-2 font-semibold'
                      >
                        Mark as Read
                      </button>
                    )}
                    {completedLessons[lesson.id] && (
                      <p className="text-green-500">Lesson completed!</p>
                    )}
        </div>
      ))}
    </div>
  </div>
))}
      </div>

      {showCongratsPopup && (
        <div id="popup" className="absolute z-50 inset-0 items-center justify-center bg-black bg-opacity-40 overflow-auto">
        <div className="relative bg-cyan-950 text-white lg:w-[30%] w-[380px] h-[400px] lg:h-[40%] mt-[200px] rounded-lg p-4 mx-auto my-auto lg:flex lg:items-center lg:justify-center flex-col" style={{background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/congratulations.jpg')`}}>
            <h2 className="text-2xl font-bold mb-4 flex mx-auto justify-center items-center">Congratulations!</h2>
            <p>You have successfully completed the <span className="text-yellow-400">{ courseName }</span> course.</p>
            <p>Click the "Generate Certificate" button to access your Certificate.</p>
            <div className="flex mx-auto space-x-2 mt-[120px] items-center justify-center">
                    <button onClick={handleClaimCertificate} id="generateCertificate" class="bg-yellow-500 text-white rounded-lg px-4 py-2 mt-4 hover:bg-yellow-400">
                        Claim Certificate
                    </button> 
                <button onClick={handleClosePopup} id="closePopup" class="bg-yellow-500 text-white rounded-lg px-4 py-2 mt-4 hover:bg-yellow-400">Close</button>
            </div>
        </div>
    </div>
      )}


      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Quizzes</h2>
        {courseData.chapters_with_lessons_and_quizzes.map((chapter, index) => (
          <div key={index} className="border p-4 mb-4 rounded-lg">
            <h3 className="text-xl font-bold">{chapter.chapter.name}</h3>
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Quizzes</h4>
              {chapter.quizzes.map((quiz) => (
                <div key={quiz.id} className="ml-4 mt-2">
                  <p className="text-gray-800">{quiz.quiz_title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseContent;