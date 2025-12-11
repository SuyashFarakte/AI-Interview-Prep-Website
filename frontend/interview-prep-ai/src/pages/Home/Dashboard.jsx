import moment from "moment"; // Make sure you import moment
import React, { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../../components/Cards/SummaryCard'; // Ensure SummaryCard is imported
import DeleteAlertContent from '../../components/DeleteAlertContent';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/Modal';
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { CARD_BG } from "../../utils/data";
import CreateSessionForm from "./CreateSessionForm";




const Dashboard = () => {
  const navigate = useNavigate();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      // console.log("Fetched sessions:", response.data);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session data:", error);
    }
  };


  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <DashboardLayout>
   <div className="w-full px-4 sm:px-6 md:px-9 pt-4 pb-20 md:pb-24">
   <div className="pt-1 pb-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-7">
    {sessions.length > 0 ? (
      sessions.map((data, index) => (
        <SummaryCard
          key={data?._id}
          colors={CARD_BG[index % CARD_BG.length]}
          role={data?.role || ""}
          topicsToFocus={data?.topicsToFocus || ""}
          experience={data?.experience || "-"}
          questions={data?.questions?.length || "-"}
          description={data?.description || ""}
          lastUpdated={
            data?.updatedAt
              ? moment(data.updatedAt).format("Do MMM YYYY")
              : ""
          }
          onSelect={() => navigate(`/interview-prep/${data?._id}`)}
          onDelete={() => setOpenDeleteAlert({ open: true, data })}
        />
      ))
    ) : (
      <p className="col-span-full text-center text-gray-500 text-sm sm:text-base py-10">
        No sessions yet.
      </p>
    )}
  </div>
</div>


  <button
    className="h-12 md:h-12 flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-xs sm:text-sm font-semibold text-white px-4 sm:px-7 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-300 fixed bottom-6 sm:bottom-10 md:bottom-20 right-4 sm:right-10 md:right-20 shadow-lg z-50"
    onClick={() => setOpenCreateModal(true)}
  >
    <LuPlus className="text-xl sm:text-2xl text-white" />
    <span className="hidden sm:inline">Add New</span>
    <span className="sm:hidden">Add</span>
  </button>
      </div>

      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
        }}
        hideHeader
      >

        <CreateSessionForm />

      </Modal>

      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null })
        }}
        title="Delete Alert"
      >
        <div className='min-w-[300px] max-w-[90vw] p-4'>
          <DeleteAlertContent
            content="Are you sure you want to delete this session detail?"
            onDelete={() => deleteSession(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
