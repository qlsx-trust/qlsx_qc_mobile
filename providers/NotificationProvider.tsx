import ShowWarningNotificationModal from '@/components/home/ShowWarningNotificationModal';
import { CommonRepository } from '@/repositories/CommonRepository';
import { INotification } from '@/types/notification';
import { PromiseAllSettled } from '@/utils/Mixed';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const initialState: StateType = {
    notifications: [],
    readNotification() {},
};

export const NotificationContext = createContext<StateType>(initialState);

type StateType = {
    notifications: INotification[];
    readNotification(id: string): void;
};

export interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationContextProvider = ({ children }: NotificationProviderProps) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [showWarningNotificationModal, setShowWarningNotificationModal] =
        useState<boolean>(false);

    useEffect(() => {
        const getNotifications = async () => {
            try {
                const response = await CommonRepository.getListNotification();
                if (!response.error) {
                    setNotifications(response.data || []);
                    setShowWarningNotificationModal(response.data?.length > 0);
                }
            } catch (error) {
                console.log('@Error: ', error);
            }
        };
        getNotifications();
        // Set up interval to call every 20 seconds
        const intervalId = setInterval(getNotifications, 2 * 10 * 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const readNotification = async (id: string) => {
        try {
            setNotifications((current) => current.filter((item) => item.id != id));
            CommonRepository.readNotification(id);
        } catch (error) {
            console.log('@Error: ', error);
        }
    };

    const handleReadAllNotifications = async () => {
        try {
            const readNotificationPromises = notifications.map((notification) =>
                CommonRepository.readNotification(notification.id)
            );
            PromiseAllSettled(readNotificationPromises);
            setNotifications([]);
        } catch (error) {
            console.log('@Error: ', error);
        }
    };

    const notificationContextValues = useMemo(
        () => ({
            notifications,
            readNotification,
        }),
        [notifications, readNotification]
    );

    return (
        <NotificationContext.Provider value={notificationContextValues}>
            {children}
            {showWarningNotificationModal && (
                <ShowWarningNotificationModal
                    notifications={notifications}
                    onReadNotifications={handleReadAllNotifications}
                    modalProps={{
                        visible: showWarningNotificationModal,
                        onClose: () => setShowWarningNotificationModal(false),
                    }}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (context === undefined)
        throw new Error(
            'useNotificationContext should be used within a NotificationContextProvider '
        );

    return context;
};
