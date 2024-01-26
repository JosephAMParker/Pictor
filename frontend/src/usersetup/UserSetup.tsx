import * as React from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../Constants'; 

const UserSetup: React.FC = () => {
    const navigate = useNavigate(); 

    React.useEffect(() => {
    const setupUser = async () => {
        try {
            // Fetch user_id from query parameters
            const urlSearchParams = new URLSearchParams(window.location.search);
            const user_id = urlSearchParams.get('u');

            // Check if user_type already exists in local storage
            const existingUserType = localStorage.getItem('user_type') && localStorage.getItem('user_type') !== 'UnknownUser';

            if (!existingUserType && user_id) {  

                const formData = new FormData(); 
                formData.append('u', user_id.toString());
                const response = await axios.post(apiUrl + '/api/setup-user', formData);

                // Save user type in local storage
                const user_type = response.data;
                localStorage.setItem('user_type', user_type);

                // Trigger a custom event to signal that the setup is complete
                const event = new Event('userSetupComplete');
                window.dispatchEvent(event);

                const urlWithoutParams = window.location.pathname;
                navigate(urlWithoutParams);
            }
        } catch (error) {
            console.error('Error setting up user:', error); 
        }
    };

    setupUser();
    }, [navigate]);

    return null; // This component doesn't render anything visible
};

export default UserSetup;
