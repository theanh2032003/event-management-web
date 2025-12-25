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
  const [groupTaskTypes, setGroupTaskTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);

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
    // Skip if already loaded
    if (dropdownsLoaded) {
      return;
    }

    try {
      setLoadingDropdowns(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🔴 No access token found for dropdown fetch");
        setDropdownsLoaded(true);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "enterprise-id": enterpriseId,
      };

      // Fetch group task types
      const typesResponse = await axiosClient.get("/group-task-type", { headers });
      const typesData = typesResponse.data || typesResponse;
      const typesArray = Array.isArray(typesData) ? typesData : [];
      setGroupTaskTypes(typesArray);

      // Fetch locations - Get all locations for enterprise
      try {
        const locationsResponse = await locationApi.getLocations(true);
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
      } catch (locationErr) {
        setLocations([]);
      }

      setDropdownsLoaded(true);
    } catch (err) {
      console.error("❌ Error fetching dropdowns:", err);
      setDropdownsLoaded(true);
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

      const userId = getCurrentUserId();

      // Build filter object theo API documentation
      const filter = {};
      
      if (searchTerm.trim()) {
        filter.keyword = searchTerm.trim();
      }
      
      if (filterState !== "ALL") {
        filter.state = filterState;
      }
      
      if (filterCategory !== "ALL") {
        filter.category = filterCategory;
      }


      // Build params object - flatten filter params into query params
      const params = {
        page: page,
        size: rowsPerPage,
      };

      // Add filter fields as individual params
      if (filter.keyword) {
        params.keyword = filter.keyword;
      }
      if (filter.state) {
        params.state = filter.state;
      }
      if (filter.category) {
        params.category = filter.category;
      }


      const response = await axiosClient.get("/project", {
        headers: {
          Authorization: `Bearer ${token}`,
          "enterprise-id": enterpriseId,
          "user-id": userId,
          "owner": "true",
        },
        params: params,
      });


      // Handle different response structures
      let eventsData = [];
      let total = 0;

      // Case 1: Paginated response with content
      if (response?.content && Array.isArray(response.content)) {
        eventsData = response.content;
        total = response.totalElements || response.total || response.content.length;
      }
      // Case 2: Response has data property with content
      else if (response?.data?.content && Array.isArray(response.data.content)) {
        eventsData = response.data.content;
        total = response.data.totalElements || response.data.total || response.data.content.length;
      }
      // Case 3: Response has metadata (old format)
      else if (response?.metadata) {
        eventsData = Array.isArray(response.data) ? response.data : [];
        total = response.metadata.total || 0;
      }
      // Case 4: Response is array directly (non-paginated)
      else if (Array.isArray(response)) {
        eventsData = response;
        total = response.length;
      }
      // Case 5: Response has data property (array)
      else if (response?.data && Array.isArray(response.data)) {
        eventsData = response.data;
        total = response.data.length;
      }

      setEvents(eventsData);
      setFilteredEvents(eventsData);
      setTotalCount(total);
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
      }
      // Priority 3: Use first available location
      else if (locations.length > 0) {
        locationId = locations[0].id;
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
      console.error("❌ Error status:", err?.response?.status);

      let errorMessage = "Không thể lưu sự kiện.";
      
      // Check for 401 Unauthorized
      if (err.response?.status === 401) {
        errorMessage = err.response?.data?.message || "Không có quyền thực hiện thao tác này.";
      }
      // Check for validation errors from form
      else if (err.message && err.message.startsWith("Vui lòng")) {
        errorMessage = err.message;
      }
      // Check for other API errors
      else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      // Fallback to general error message
      else if (err.message) {
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
  }, []); // Empty dependency - fetch only once on mount

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

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    // Accept number directly (from CommonTable) or event object (legacy)
    const value = typeof newRowsPerPage === 'number' 
      ? newRowsPerPage 
      : parseInt(newRowsPerPage?.target?.value, 10);
    setRowsPerPage(value);
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
    fetchDropdownData, // Expose để có thể refetch thủ công nếu cần

    // Helpers
    formatDateTimeLocal,
    getCurrentDateTimeLocal,
  };
};
