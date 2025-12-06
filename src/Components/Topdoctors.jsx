import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../redux/doctor";

const Topdoctors = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAll, setShowAll] = useState(false);

 
  const { doctors, loading } = useSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const displayedDoctors = showAll ? doctors : doctors.slice(0, 5);

  if (loading) return <p className="text-center mt-10">Loading doctors...</p>;

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
      <h1 className='text-3xl font-medium text-center'>Top Doctors You Can Trust</h1>
      <p className='sm:w-1/3 text-center text-sm'>
        Explore our curated list of highly rated and experienced doctors who are ready to assist you.
      </p>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 gap-y-6 pt-5 px-3 sm:px-0'>
        {displayedDoctors.map((item) => (
          <div
            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[10px] transition-all duration-500'
            onClick={() => navigate(`/appointment/${item._id}`)}
            key={item._id}
          >
            <img className='bg-blue-50 w-full' src={item.image} alt="" />
            <div className='p-4'>
              <div className='flex items-center gap-2 text-sm text-green-500'>
                <p className='w-2 h-2 bg-green-500 rounded-full'></p>
                <p>Available</p>
              </div>
              <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
              <p className='text-gray-600 text-sm'>{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAll(!showAll)}
        className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 cursor-pointer'
      >
        {showAll ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default Topdoctors;
