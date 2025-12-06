import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

export const backendUrl = "https://prescript-backend-1.onrender.com/";

// Fetch doctors
export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async () => {
    const response = await axios.get(`${backendUrl}api/doctor/list`);
    return response.data.doctors;
  }
);

// Fetch user profile
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { getState }) => {
    const token = getState().doctor.token;
    const response = await axios.get(`${backendUrl}api/user/user-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response.data);
    return response.data.userData;
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (formData, { getState }) => {
    const token = getState().doctor.token;
    const response = await axios.put(
      `${backendUrl}api/user/update-profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
);

// Fetch appointments
export const fetchAppointments = createAsyncThunk(
  "doctor/fetchAppointments",
  async (_, { getState }) => {
    const token = getState().doctor.token;
    const response = await axios.get(`${backendUrl}api/user/list-appointment`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.appointments;
  }
);

// Cancel appointment
export const cancelAppointment = createAsyncThunk(
  "doctor/cancelAppointment",
  async (appointmentId, { getState, rejectWithValue }) => {
    try {
      const token = getState().doctor.token;

      const response = await axios.post(
        `${backendUrl}api/user/cancel-appointment`,
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        appointmentId,
        ...response.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Server Error");
    }
  }
);

// Request offline payment
export const requestOfflinePayment = createAsyncThunk(
  "user/requestOfflinePayment",
  async (appointmentId, { getState }) => {
    const token = getState().doctor.token;
    const response = await axios.post(
      `${backendUrl}api/user/offline-payment`,
      { appointmentId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { appointmentId, ...response.data };
  }
);

export const createRazorpayOrder = createAsyncThunk(
  "doctor/createRazorpayOrder",
  async (appointmentId, { getState }) => {
    const token = getState().doctor.token;
    const response = await axios.post(
      `${backendUrl}api/user/razorpay-create`,
      { appointmentId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { appointmentId, ...response.data };
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "doctor/verifyRazorpayPayment",
  async (
    {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
    { getState }
  ) => {
    const token = getState().doctor.token;
    const response = await axios.post(
      `${backendUrl}api/user/razorpay-verify`,
      { razorpay_order_id, razorpay_payment_id, razorpay_signature },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { appointmentId, ...response.data };
  }
);

export const fetchLatestNotification = createAsyncThunk(
  "doctor/fetchLatestNotification",
  async (_, { getState }) => {
    const token = getState().doctor.token;
    const response = await axios.post(
      `${backendUrl}api/user/notifications`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Notification response:", response.data);
    return {
      appointmentId: response.data.appointmentId,
      message: response.data.notification, 
      doctorName: response.data.doctorName,
      slotDate: response.data.slotDate,
      slotTime: response.data.slotTime,
      status: response.data.status,
    };
  }
);

const doctorSlice = createSlice({
  name: "doctor",

  initialState: {
    doctors: [],
    loading: false,
    error: null,
    token: null,
    user: {},
    appointments: [],
    latestNotification: null,
    notificationAppointmentId: null,
    notificationDoctorName: null,
    notificationSlotDate: null,
    notificationSlotTime: null,
    notificationStatus: null,
    showNotificationModal: false,
  },

  reducers: {
    setToken: (state, action) => {
      // state.token = action.payload;
      // sessionStorage.setItem("token", action.payload);
      state.token = action.payload.token;
      state.user = action.payload.user;
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    clearToken: (state) => {
      state.token = null;
      sessionStorage.removeItem("token");
    },

    //   loadToken: (state) => {
    //     // const saved = sessionStorage.getItem("token");
    //     // if (saved) state.token = saved;

    // if (savedToken) state.token = savedToken;
    // if (savedUser) state.user = JSON.parse(savedUser);
    //   },
    loadToken: (state) => {
      const savedToken = sessionStorage.getItem("token");
      const savedUser = sessionStorage.getItem("user");

      if (savedToken) state.token = savedToken;

      if (savedUser) {
        try {
          state.user = JSON.parse(savedUser);
        } catch (err) {
          console.error("Failed to parse user from sessionStorage:", err);
          state.user = {};
          sessionStorage.removeItem("user");
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.updatedUser;
        sessionStorage.setItem(
          "user",
          JSON.stringify(action.payload.updatedUser)
        );
      })

      // Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state) => {
        state.loading = false;
      })

      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.appointments = state.appointments.map((a) =>
            a._id === action.payload.appointmentId
              ? { ...a, cancelled: true, cancelledBy: "user" }
              : a
          );
        }
      })

      // Offline payment
      .addCase(requestOfflinePayment.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.appointments = state.appointments.map((a) =>
            a._id === action.payload.appointmentId
              ? { ...a, paymentStatus: "requested", paymentMethod: "offline" }
              : a
          );
        }
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {})

      // Verify Razorpay payment -> mark appointment paid
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.appointments = state.appointments.map((a) =>
            a._id === action.payload.appointmentId
              ? { ...a, payment: true, paymentStatus: "paid" }
              : a
          );
        }
      })

      .addCase(fetchLatestNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLatestNotification.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.latestNotification = action.payload.notification;
          state.notificationAppointmentId = action.payload.appointmentId;
          state.notificationDoctorName = action.payload.doctorName;
          state.notificationSlotDate = action.payload.slotDate;
          state.notificationSlotTime = action.payload.slotTime;
          state.notificationStatus = action.payload.status;
          state.showNotificationModal = true;
        }
      })
      .addCase(fetchLatestNotification.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setToken, clearToken, loadToken } = doctorSlice.actions;

export default doctorSlice.reducer;
