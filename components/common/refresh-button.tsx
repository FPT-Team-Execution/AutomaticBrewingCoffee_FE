import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

type RefreshButtonProps = {
    loading: boolean;
    toggleLoading: () => void;
};

const RefreshButton: React.FC<RefreshButtonProps> = ({ loading, toggleLoading }) => {
    return (
        <Button
            onClick={toggleLoading}
            effect="shineHover"
            className="h-10 px-4 flex items-center text-white hover:opacity-90 transition"
        >
            <RefreshCw className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            {"Làm mới"}
        </Button>
    );
};

export default RefreshButton;
