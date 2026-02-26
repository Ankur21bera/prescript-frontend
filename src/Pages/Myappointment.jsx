
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  backendUrl,
  cancelAppointment,
  fetchAppointments,
  requestOfflinePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchLatestNotification,
} from "../redux/doctor";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";

const MyAppointments = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.doctor.loading);
  const storeAppointments = useSelector((state) => state.doctor.appointments);
  const token = useSelector((state) => state.doctor.token);
  const latestNotification = useSelector(
    (state) => state.doctor.latestNotification
  );

  const [localAppointments, setLocalAppointments] = useState([]);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [offlineLoadingId, setOfflineLoadingId] = useState(null);
  const [razorpayLoadingId, setRazorpayLoadingId] = useState(null);
  const [popupData, setPopupData] = useState(null); // unified popup
  const [showPopup, setShowPopup] = useState(false);

  const RAZORPAY_KEY =
    import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_coLgwFDO6R5O3X";

  // Fetch appointments and latest notification
  useEffect(() => {
    if (token) {
      dispatch(fetchAppointments());
      dispatch(fetchLatestNotification());
    }
  }, [token, dispatch]);

  // Update localAppointments when storeAppointments or latestNotification changes
  useEffect(() => {
    if (!storeAppointments) return;

    const updatedAppointments = storeAppointments.map((appointment) => {
      const latestNotif =
        latestNotification &&
        latestNotification.appointmentId === appointment._id
          ? latestNotification
          : null;
      return { ...appointment, latestNotification: latestNotif };
    });

    setLocalAppointments(updatedAppointments);

    // Show admin-cancelled popup if exists and not acknowledged
    const latestCancelled = updatedAppointments
      .filter((a) => a.cancelled && a.cancelledBy === "admin")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    if (latestCancelled && !localStorage.getItem(`ack_${latestCancelled._id}`)) {
      setPopupData({
        appointmentId: latestCancelled._id,
        message:
          latestCancelled.latestNotification?.message ||
          "Your appointment has been cancelled by admin.",
        status: "cancelled",
        doctorName: latestCancelled.docData?.name,
        slotDate: latestCancelled.slotDate,
        slotTime: latestCancelled.slotTime,
      });
      setShowPopup(true);
    }
  }, [storeAppointments, latestNotification]);

  // Handle socket events
  useEffect(() => {
    if (!token) return;

    const socket = io(backendUrl);
    const userId = storeAppointments?.[0]?.userId;
    if (userId) socket.emit("join-room", userId);

    // Offline payment approved
    socket.on("offline-payment-approved", ({ appointmentId, message }) => {
      setLocalAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId
            ? { ...a, paymentStatus: "paid", payment: true }
            : a
        )
      );
      toast.success(message || "Offline payment approved!");
    });

    // Appointment updated
    socket.on("appointment-updated", (payload) => {
      if (!payload?.appointmentId) return;
      setLocalAppointments((prev) =>
        prev.map((a) =>
          a._id === payload.appointmentId ? { ...a, ...payload.updates } : a
        )
      );
    });

    // Appointment cancelled
    socket.on("appointment-cancelled", ({ appointmentId, message }) => {
      setPopupData({
        appointmentId,
        message: message || "Your appointment has been cancelled by admin",
        status: "cancelled",
        doctorName: localAppointments.find(a => a._id === appointmentId)?.docData?.name,
        slotDate: localAppointments.find(a => a._id === appointmentId)?.slotDate,
        slotTime: localAppointments.find(a => a._id === appointmentId)?.slotTime,
      });
      setShowPopup(true);

      setLocalAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId
            ? { ...a, cancelled: true, cancelledBy: "admin", acknowledged: false }
            : a
        )
      );
    });

    // Appointment completed
    socket.on("appointment-completed", ({ appointmentId, message }) => {
      setPopupData({
        appointmentId,
        message: message || "Your appointment has been completed",
        status: "completed",
        doctorName: localAppointments.find(a => a._id === appointmentId)?.docData?.name,
        slotDate: localAppointments.find(a => a._id === appointmentId)?.slotDate,
        slotTime: localAppointments.find(a => a._id === appointmentId)?.slotTime,
      });
      setShowPopup(true);

      setLocalAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, isCompleted: true, cancelled: false } : a
        )
      );
    });

    return () => socket.disconnect();
  }, [token, storeAppointments, localAppointments]);

  // Popup OK handler
  const handlePopupOk = () => {
    if (!popupData) return;
    localStorage.setItem(`ack_${popupData.appointmentId}`, "true");
    setPopupData(null);
    setShowPopup(false);
  };

  // Cancel appointment
  const handleCancel = async (appointmentId) => {
    try {
      setCancelLoadingId(appointmentId);
      const result = await dispatch(cancelAppointment(appointmentId)).unwrap();
      if (result.success) {
        setLocalAppointments((prev) =>
          prev.map((a) =>
            a._id === appointmentId ? { ...a, cancelled: true } : a
          )
        );
        toast.success(result.message || "Appointment cancelled");
      } else {
        toast.error(result.message || "Failed To Cancel");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setCancelLoadingId(null);
    }
  };

  // Offline payment request
  const handleOfflinePayment = async (appointmentId) => {
    setOfflineLoadingId(appointmentId);
    const prevAppointments = localAppointments;

    setLocalAppointments((prev) =>
      prev.map((a) =>
        a._id === appointmentId
          ? { ...a, paymentStatus: "requested", paymentMethod: "offline" }
          : a
      )
    );

    try {
      const result = await dispatch(requestOfflinePayment(appointmentId)).unwrap();
      if (result.success) {
        toast.success("Offline payment request sent — waiting for admin approval");
      } else {
        setLocalAppointments(prevAppointments);
        toast.error(result.message || "Failed to request offline payment");
      }
    } catch (error) {
      console.error(error);
      setLocalAppointments(prevAppointments);
      toast.error("Something went wrong while requesting offline payment");
    } finally {
      setOfflineLoadingId(null);
    }
  };

  // Razorpay payment
  const handleRazorpay = async (appointmentId) => {
    try {
      setRazorpayLoadingId(appointmentId);
      const createRes = await dispatch(createRazorpayOrder(appointmentId)).unwrap();

      if (!createRes.success || !createRes.order) {
        toast.error(createRes.message || "Unable to create Razorpay order");
        return;
      }

      const order = createRes.order;
      if (!window.Razorpay) {
        toast.error("Razorpay SDK missing");
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Payment",
        description: "Appointment payment",
        handler: async (response) => {
          try {
            const verifyRes = await dispatch(
              verifyRazorpayPayment({
                appointmentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            ).unwrap();

            if (verifyRes.success) {
              setLocalAppointments((prev) =>
                prev.map((p) =>
                  p._id === appointmentId ? { ...p, payment: true, paymentStatus: "paid" } : p
                )
              );
              toast.success("Payment successful");
            } else {
              toast.error(verifyRes.message || "Verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Razorpay error");
    } finally {
      setRazorpayLoadingId(null);
    }
  };

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  return (
    <div className="p-4">
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointments</p>

      {loading && <p className="text-center py-10 text-gray-600">Loading...</p>}

      {!loading && (!localAppointments || localAppointments.length === 0) && (
        <p className="text-center text-gray-500 mt-10">You have no appointments.</p>
      )}

      <div className="space-y-4">
        {localAppointments?.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
          >
            <div>
              <img className="w-32 bg-indigo-50" src={item.docData?.image} alt="" />
            </div>

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{item.docData?.name}</p>
              <p>{item.docData?.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData?.address?.line1}</p>
              <p className="text-xs">{item.docData?.address?.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">Date & Time:</span>{" "}
                {item.slotDate} | {item.slotTime}
              </p>
              <p className="text-xs mt-1">
                <span className="font-medium">Payment:</span>{" "}
                {item.payment || item.paymentStatus === "paid" ? "Paid" : "Not Paid"}
              </p>
              <p className="text-xs">
                <span className="font-medium">Status:</span>{" "}
                {item.cancelled ? "Cancelled" : item.isCompleted ? "Completed" : "Upcoming"}
              </p>
              {item.latestNotification && (
                <p className="text-xs mt-1 text-blue-600">
                  <span className="font-medium">Notification:</span> {item.latestNotification.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 justify-center items-center">
              {item.cancelled ? (
                <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md cursor-default">
                  Cancelled
                </button>
              ) : item.isCompleted ? (
                <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md cursor-default">
                  Completed
                </button>
              ) : (
                <>
                  {(item.payment || item.paymentStatus === "paid") && (
                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md cursor-default">
                      Payment Successful
                    </button>
                  )}

                  {!item.payment && item.paymentStatus !== "paid" && (
                    <>
                      {item.paymentStatus !== "requested" && (
                        <button
                          onClick={() => handleOfflinePayment(item._id)}
                          disabled={offlineLoadingId === item._id}
                          className="w-full sm:w-48 py-2 rounded-md text-sm font-medium border flex items-center justify-center text-stone-500 hover:bg-green-600 hover:text-white transition-all duration-200"
                        >
                          {offlineLoadingId === item._id ? "Requesting..." : "Pay Offline"}
                        </button>
                      )}
                      {item.paymentStatus === "requested" && (
                        <button className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg shadow-md cursor-default">
                          Waiting For Approval
                        </button>
                      )}
                      <button
                        onClick={() => handleRazorpay(item._id)}
                        disabled={razorpayLoadingId === item._id}
                        className="w-full sm:w-48 py-2 rounded-md text-sm font-medium border flex items-center justify-center text-purple-600 border-purple-400 hover:bg-purple-600 hover:text-white transition-all duration-200"
                      >
                        {razorpayLoadingId === item._id ? "Processing..." : "Pay with Razorpay"}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      const ok = window.confirm("Are you sure you want to cancel?");
                      if (ok) handleCancel(item._id);
                    }}
                    disabled={cancelLoadingId === item._id}
                    className="text-sm cursor-pointer text-center sm:min-w-48 py-2 border text-stone-500 hover:bg-red-600 hover:text-white transition"
                  >
                    {cancelLoadingId === item._id ? "Cancelling..." : "Cancel Appointment"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Modal show={showPopup} size="md" popup onClose={() => setShowPopup(false)}>
  <ModalHeader className="text-center">
    {popupData?.status === "Cancelled" ? (
      <span className="flex items-center justify-center gap-2 text-red-600 font-bold">
         
      </span>
    ) : (
      <span className="flex items-center justify-center gap-2 text-green-600 font-bold">
       
      </span>
    )}
  </ModalHeader>
  
  <ModalBody>
    {popupData && (
      <div className="space-y-4 text-center px-4 py-2">
        <p className="text-gray-700 text-base">{popupData.message}</p>

        {popupData.doctorName && (
          <p className="text-gray-800 font-semibold flex items-center justify-center gap-2">
            Doctor: {popupData.doctorName}
          </p>
        )}

        {(popupData.slotDate || popupData.slotTime) && (
          <p className="text-gray-700 flex items-center justify-center gap-2">
           {popupData.slotDate} | {popupData.slotTime}
          </p>
        )}

        <p className={`font-semibold px-3 py-1 rounded-full inline-block ${
          popupData.status === "Cancelled" ? "bg-red-100 text-red-700" :
          popupData.status === "Completed" ? "bg-green-100 text-green-700" :
          "bg-gray-100 text-gray-700"
        }`}>
          
        </p>
      </div>
    )}
  </ModalBody>

  <div className="p-4 flex justify-center">
    <Button color="purple" size="md" onClick={handlePopupOk}>
      OK
    </Button>
  </div>
</Modal>
    </div>
  );
};

export default MyAppointments;
