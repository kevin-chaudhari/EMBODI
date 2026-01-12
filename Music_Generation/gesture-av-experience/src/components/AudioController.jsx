import { useAudio } from '../hooks/useAudio';

export const AudioController = ({ isActive }) => {
    useAudio(isActive);
    return null;
};
