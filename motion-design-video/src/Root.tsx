import { Composition } from "remotion";
import { MotionDesignVideo } from "./MotionDesignVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AnalyseBalistique"
        component={MotionDesignVideo}
        durationInFrames={30 * 62}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
