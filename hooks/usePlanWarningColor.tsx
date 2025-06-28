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
        if (!machineStartTime || !productionEndTime) {
            setColor('transparent');
            return;
        }
        // Tạo hiệu ứng nhấp nháy (đỏ - transparent) mỗi 1 giây
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(machineStartTime).getTime();
            const end = new Date(productionEndTime).getTime();
            const toleranceMs = toleranceTime * 60 * 1000; //ms
            const gapMs = gapReviewTime * 60 * 1000; //ms
            const warningTime = TIME_WARNING_THRESHOLD * 60 * 1000;
            const firstReview = start + toleranceMs;

            // Nếu thời gian hiện tại lớn hơn productionEndTime, trả về transparent
            // End time
            if (now > end) {
                setColor('transparent');
                return;
            }

            if (now < firstReview) {
                // Before firstReview
                if (now >= firstReview - warningTime) {
                    setColor('red'); // Warning period before first review
                } else {
                    setColor('transparent');
                }
            } else {
                // After firstReview
                const timeSinceFirstReview = now - firstReview;
                const cyclePosition = timeSinceFirstReview % gapMs;
                if (cyclePosition >= gapMs - warningTime) {
                    setColor('red'); // Warning period before subsequent reviews
                } else {
                    setColor('transparent');
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [machineStartTime, toleranceTime, gapReviewTime, productionEndTime]);

    return color;
};

export default usePlanWarningColor;
