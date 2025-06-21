import { useEffect, useState } from 'react';

const usePlanWarningColor = ({
    machineStartTime, // Date object or ISO string
    toleranceTime, // in minutes
    gapReviewTime, // in minutes
    productionEndTime, // Date object or ISO string
}: {
    machineStartTime: string;
    productionEndTime: string;
    toleranceTime: number;
    gapReviewTime: number;
}) => {
    const [color, setColor] = useState('transparent');

    const TIME_WARNING_THRESHOLD = 20;

    useEffect(() => {
        const checkBlink = () => {
            if (!machineStartTime || !productionEndTime) {
                setColor('transparent');
                return;
            }

            const now = new Date();
            const start = new Date(machineStartTime);
            const end = new Date(productionEndTime);
            const toleranceMs = toleranceTime * 60 * 1000; //ms
            const gapMs = gapReviewTime * 60 * 1000; //ms

            // Nếu thời gian hiện tại lớn hơn productionEndTime, trả về transparent
            if (now > end) {
                setColor('transparent');
                return;
            }

            // Tính thời điểm bắt đầu cảnh báo (machineStartTime + toleranceTime - 20 phút)
            const warningStart = new Date(
                start.getTime() + toleranceMs - TIME_WARNING_THRESHOLD * 60 * 1000
            );
            if (now < warningStart) {
                setColor('transparent');
                return;
            }

            // Tính các mốc thời gian nhấp nháy (cách nhau gapReviewTime)
            const timeSinceWarningStart = now.getTime() - warningStart.getTime();
            const isBlinkTime = gapMs && 
                Math.floor(timeSinceWarningStart / gapMs) * gapMs <= timeSinceWarningStart;

            // Tạo hiệu ứng nhấp nháy (đỏ - transparent) mỗi 1 giây
            const interval = setInterval(() => {
                if (isBlinkTime) {
                    setColor((prev) => (prev === 'red' ? 'transparent' : 'red'));
                } else {
                    setColor('transparent');
                }
            }, 1000);

            return () => clearInterval(interval);
        };

        checkBlink();
        // Cập nhật mỗi phút để kiểm tra mốc thời gian mới
        const timer = setInterval(checkBlink, 60 * 1000);

        return () => clearInterval(timer);
    }, [machineStartTime, toleranceTime, gapReviewTime, productionEndTime]);

    return color;
};

export default usePlanWarningColor;
