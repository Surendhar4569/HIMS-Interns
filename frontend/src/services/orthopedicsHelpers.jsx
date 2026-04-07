export const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // Create a new Date object
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "";
    
    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

export const cleanPhoneNumber = (phone) => {
        if (!phone) return null;
        return phone.replace(/\D/g, '');
    };

export const calculateAge = (dob) => {
        if (!dob) return "";
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };


export const generatePatientVisitId = () => {
        const date = new Date();
        const year = date.getFullYear();
        const randomNum = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
        return `ORTH-${year}-${randomNum}`;
        };


export      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    export  const formatDateOnly = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };