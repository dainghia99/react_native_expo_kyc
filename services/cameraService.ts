import { Camera as ExpoCamera } from "expo-camera";
import type { CameraType } from "expo-camera";

export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ExpoCamera.requestCameraPermissionsAsync();
  return status === "granted";
};

export const startRecording = async (
  cameraRef: React.RefObject<typeof ExpoCamera>
): Promise<{ uri: string } | null> => {
  if (cameraRef.current) {
    try {
      return await cameraRef.current.recordAsync();
    } catch (error) {
      console.error("Error recording video:", error);
      return null;
    }
  }
  return null;
};

export const stopRecording = (
  cameraRef: React.RefObject<typeof ExpoCamera>
): void => {
  if (cameraRef.current) {
    cameraRef.current.stopRecording();
  }
};

export const CameraTypes = {
  front: "front" as CameraType,
  back: "back" as CameraType,
};
