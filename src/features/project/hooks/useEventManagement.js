import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../app/axios/axiosClient";
import locationApi from "../../location/api/location.api";

/**
 * Custom hook để quản lý logic của Event Management
 * Bao gồm: fetch events, create, update, delete, filter, search
 */
export const useEventManagement = () => {
  const { id: enterpriseId } = useParams();

  // States
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown data
  const [groupTaskStates, setGroupTaskStates] = useState([]);
  const [groupTaskTypes, setGroupTaskTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("ALL");
  const [filterFeeType, setFilterFeeType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // ====== HELPER FUNCTIONS ======
  const getCurrentUserId = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || 1;
      } catch (e) {
        return 1;
      }
    }
    return 1;
  };

  const formatDateTimeLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getCurrentDateTimeLocal = () => {
    return formatDateTimeLocal(new Date());
  };

  // ====== FETCH DROPDOWN DATA ======
  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🔴 No access token found for dropdown fetch");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "enterprise-id": enterpriseId,
      };

      // Fetch group task states
      const statesResponse = await axiosClient.get("/group-task-state", { headers });
      const statesData = statesResponse.data || statesResponse;
      const statesArray = Array.isArray(statesData) ? statesData : [];
      setGroupTaskStates(statesArray);

      // Fetch group task types
      const typesResponse = await axiosClient.get("/group-task-type", { headers });
      const typesData = typesResponse.data || typesResponse;
      const typesArray = Array.isArray(typesData) ? typesData : [];
      setGroupTaskTypes(typesArray);

      // Fetch locations - Get all locations for enterprise
      try {
        const locationsResponse = await locationApi.getLocations(enterpriseId);
        // Handle different response structures
        let locationsArray = [];
        if (Array.isArray(locationsResponse)) {
          locationsArray = locationsResponse;
        } else if (locationsResponse?.data) {
          locationsArray = Array.isArray(locationsResponse.data) ? locationsResponse.data : [];
        } else if (locationsResponse?.content) {
          locationsArray = Array.isArray(locationsResponse.content) ? locationsResponse.content : [];
        }
        setLocations(locationsArray);
        console.log(`✅ Fetched ${locationsArray.length} locations`);
      } catch (locationErr) {
        console.error("❌ Error fetching locations:", locationErr);
        setLocations([]);
      }
    } catch (err) {
      console.error("❌ Error fetching dropdown data:", err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // ====== FETCH EVENTS ======
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token không tồn tại. Vui lòng đăng nhập lại.");
        console.error("🔴 No access token found in localStorage");
        setLoading(false);
        return;
      }

      // Build query params for pagination and filtering
      const params = {
        page: page,
        size: rowsPerPage,
      };

      // Add filter params if not "ALL"
      if (searchTerm.trim()) {
        params.name = searchTerm.trim();
      }
      if (filterState !== "ALL") {
        params.state = filterState;
      }
      if (filterFeeType !== "ALL") {
        params.feeType = filterFeeType;
      }
      if (filterCategory !== "ALL") {
        params.category = filterCategory;
      }

      const response = await axiosClient.get("/project", {
        headers: {
          Authorization: `Bearer ${token}`,
          "enterprise-id": enterpriseId,
          owner: "true",
        },
        params: params,
      });

      // Handle different response structures
      // Case 1: Response has metadata (paginated response)
      if (response?.metadata) {
        const data = response.data || [];
        const total = response.metadata.total || 0;
        setEvents(Array.isArray(data) ? data : []);
        setFilteredEvents(Array.isArray(data) ? data : []);
        setTotalCount(total);
      }
      // Case 2: Response is array directly (non-paginated)
      else if (Array.isArray(response)) {
        setEvents(response);
        setFilteredEvents(response);
        setTotalCount(response.length);
      }
      // Case 3: Response has data property (array)
      else if (response?.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setEvents(dataArray);
        setFilteredEvents(dataArray);
        setTotalCount(dataArray.length);
      }
      // Case 4: Fallback
      else {
        setEvents([]);
        setFilteredEvents([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("❌ Error fetching events:", err);
      setError(
        "Không thể tải danh sách sự kiện. " +
          (err?.response?.data?.message || err.message || "")
      );
      setEvents([]);
      setFilteredEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ====== UPDATE EVENT STATE ======
  const handleUpdateEventState = async (eventId, newState) => {
    try {
      await axiosClient.patch(`/project/${eventId}`, null, {
        params: {
          state: newState,
        },
      });

      await fetchEvents();
    } catch (err) {
      console.error("❌ Error updating event state:", err);
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  // ====== DELETE EVENT ======
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      return;
    }

    try {
      await axiosClient.delete(`/project/${eventId}`, {
        headers: {
          "enterprise-id": enterpriseId,
        },
      });

      await fetchEvents();
    } catch (err) {
      console.error("❌ Error deleting event:", err);
      alert(err.response?.data?.message || "Không thể xóa sự kiện");
    }
  };

  // ====== SAVE EVENT ======
  const handleSaveEvent = async (eventForm, editingEvent) => {
    try {
      // Validate form
      if (!eventForm.name || !eventForm.name.trim()) {
        throw new Error("Vui lòng nhập tên sự kiện");
      }

      if (!eventForm.groupTaskStateId) {
        throw new Error("Vui lòng chọn nhóm trạng thái công việc");
      }

      if (!eventForm.groupTaskTypeId) {
        throw new Error("Vui lòng chọn nhóm loại công việc");
      }

      if (!eventForm.startedAt) {
        throw new Error("Vui lòng chọn thời gian bắt đầu");
      }

      if (!eventForm.endedAt) {
        throw new Error("Vui lòng chọn thời gian kết thúc");
      }

      const startDate = new Date(eventForm.startedAt);
      const endDate = new Date(eventForm.endedAt);
      if (endDate <= startDate) {
        throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const userId = getCurrentUserId();

      const toISOStringLocal = (dateTimeLocalStr) => {
        if (!dateTimeLocalStr) return new Date().toISOString();
        const withSeconds =
          dateTimeLocalStr.includes(":") && dateTimeLocalStr.split(":").length === 2
            ? `${dateTimeLocalStr}:00`
            : dateTimeLocalStr;
        const date = new Date(withSeconds);
        return date.toISOString();
      };

      // Get locationId from form, editing event, or use first available location
      let locationId = null;
      
      // Priority 1: Use locationId from form if provided
      if (eventForm.locationId) {
        locationId = parseInt(eventForm.locationId);
      }
      // Priority 2: Use locationId from editing event if exists
      else if (editingEvent && editingEvent.locationId) {
        locationId = parseInt(editingEvent.locationId);
        console.log(`ℹ️ Using locationId from editing event: ${locationId}`);
      }
      // Priority 3: Use first available location
      else if (locations.length > 0) {
        locationId = locations[0].id;
        console.log(`ℹ️ No locationId specified, using first location: ${locationId}`);
      }
      // Priority 4: No locations available - throw error
      else {
        throw new Error("Vui lòng tạo ít nhất một địa điểm trước khi tạo sự kiện. Vào Cài đặt > Địa điểm để tạo địa điểm mới.");
      }
      
      if (!locationId || isNaN(locationId)) {
        throw new Error("Địa điểm không hợp lệ. Vui lòng chọn địa điểm hoặc tạo địa điểm mới.");
      }

      const requestBody = {
        name: eventForm.name.trim(),
        avatar: eventForm.avatar.trim() || null,
        images: eventForm.images.filter((img) => img.trim()),
        description: eventForm.description.trim() || null,
        locationId: eventForm.locationId ? parseInt(eventForm.locationId) : null,
        visibility: eventForm.visibility,
        accessType: eventForm.accessType,
        feeType: eventForm.feeType,
        startedAt: toISOStringLocal(eventForm.startedAt),
        endedAt: toISOStringLocal(eventForm.endedAt),
        groupTaskStateId: parseInt(eventForm.groupTaskStateId),
        groupTaskTypeId: parseInt(eventForm.groupTaskTypeId),
        category: eventForm.category,
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        "user-id": userId.toString(),
        "enterprise-id": enterpriseId,
        "Content-Type": "application/json",
      };

      if (editingEvent) {
        await axiosClient.put(`/project/${editingEvent.id}`, requestBody, { headers });
      } else {
        await axiosClient.post("/project", requestBody, { headers });
      }

      await fetchEvents();
      return { success: true };
    } catch (err) {
      console.error("❌ Error saving event:", err);
      console.error("❌ Error response:", err?.response?.data);

      let errorMessage = "Không thể lưu sự kiện.";
      if (err.message && err.message.startsWith("Vui lòng")) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  // ====== FILTER & SEARCH ======
  // When filters or rowsPerPage change, reset to page 0
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterState, filterFeeType, filterCategory, rowsPerPage]);

  // ====== INITIAL LOAD & FETCH EVENTS ======
  // Fetch events when page, enterpriseId, or filters change
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, enterpriseId, searchTerm, filterState, filterFeeType, filterCategory, rowsPerPage]);

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseId]);

  // ====== CLEAR FILTERS ======
  const clearFilters = () => {
    setSearchTerm("");
    setFilterState("ALL");
    setFilterFeeType("ALL");
    setFilterCategory("ALL");
    setPage(0);
  };

  // ====== PAGINATION HANDLERS ======
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return {
    // States
    events,
    filteredEvents,
    loading,
    error,
    setError,
    enterpriseId,

    // Dropdown data
    groupTaskStates,
    groupTaskTypes,
    locations,
    loadingDropdowns,

    // Filter & Search
    searchTerm,
    setSearchTerm,
    filterState,
    setFilterState,
    filterFeeType,
    setFilterFeeType,
    filterCategory,
    setFilterCategory,
    clearFilters,

    // Pagination
    page,
    rowsPerPage,
    totalCount,
    handleChangePage,
    handleChangeRowsPerPage,

    // Actions
    handleSaveEvent,
    handleDeleteEvent,
    handleUpdateEventState,
    fetchEvents,

    // Helpers
    formatDateTimeLocal,
    getCurrentDateTimeLocal,
  };
};
