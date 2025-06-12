export type EkycSdkConfig = {
    BACKEND_URL: string;
    TOKEN_KEY: string;
    TOKEN_ID: string;
    ACCESS_TOKEN?: string;
    HAS_RESULT_SCREEN?: boolean;
    CALL_BACK_END_FLOW: (result: any) => void;
    ENABLE_API_LIVENESS_DOCUMENT?: boolean;
    ENABLE_API_LIVENESS_FACE?: boolean;
    ENABLE_API_MASKED_FACE?: boolean;
    ENABLE_API_COMPARE_FACE?: boolean;
    SDK_FLOW?: 'DOCUMENT_TO_FACE' | 'FACE_TO_DOCUMENT' | 'FACE' | 'DOCUMENT';
    LIST_TYPE_DOCUMENT?: number[];
    CUSTOM_THEME?: {
        PRIMARY_COLOR?: string;
        TEXT_COLOR_DEFAULT?: string;
        BACKGROUND_COLOR?: string;
    };
    CHALLENGE_CODE?: string;
    SHOW_STEP?: boolean;
    HAS_QR_SCAN?: boolean;
    DOCUMENT_TYPE_START?: number;
    DEFAULT_LANGUAGE?: 'vi' | 'en';
    DOUBLE_LIVENESS?: boolean;
    FAKE_CAM_LABEL?: string | RegExp;
    CALL_BACK_DOCUMENT_RESULT?: (result: any) => Promise<void>;
    LINK_ICON_CCCD?: string;
    LINK_ICON_PASSPORT?: string;
    LINK_ICON_DRIVER_LICENSE?: string;
    LINK_ICON_OTHER_PAPERS?: string;
    LINK_ICON_QR_SCAN?: string;
    HAS_BACKGROUND_IMAGE?: boolean;
    USE_METHOD?: 'BOTH' | 'PHOTO' | 'UPLOAD';
    SHOW_TAB_RESULT_INFORMATION?: boolean;
    SHOW_TAB_RESULT_VALIDATION?: boolean;
    SHOW_TAB_RESULT_QRCODE?: boolean;
    URL_WEB_OVAL?: string;
    URL_MOBILE_OVAL?: string;
    URL_ENGLISH_VIDEO_TUTORIAL?: string;
    URL_VIETNAMESE_VIDEO_TUTORIAL?: string;
    MAX_SIZE_IMAGE?: number;
    ENDPOINT_UPLOAD_IMAGE?: string;
    ENDPOINT_LIVENESS_DOCUMENT?: string;
    ENDPOINT_LIVENESS_FACE?: string;
    ENDPOINT_MASKED_FACE?: string;
    ENDPOINT_COMPARE_FACE?: string;
    ENDPOINT_OCR_DOCUMENT?: string;
    ENDPOINT_OCR_DOCUMENT_FRONT?: string;
    ENABLE_API_UPLOAD_IMAGE?: boolean;
    ENABLE_API_OCR_DOCUMENT?: boolean;
    ENABLE_API_OCR_DOCUMENT_FRONT?: boolean;
};

export enum DocumentType {
  PASSPORT = 'passport',
  ID_CARD = 'id_card',
  DRIVER_LICENSE = 'driver_license',
}


export interface Base64DocImg {
    img_front: string; // Base64 string of the front side of the document
    img_back: string; // Base64 string of the back side of the document
}
export interface LivenessCardData {
  imgs: {
    img: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: {
    face_swapping: boolean;
    fake_print_photo: boolean;
    face_swapping_prob: number;
    fake_liveness_prob: number;
    liveness: string;
    fake_liveness: boolean;
    fake_print_photo_prob: number;
    liveness_msg: string;
  };
  statusCode: number;
  challengeCode: string;
}

export interface OCRData {
  imgs: {
    img_back: string;
    img_front: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: {
    origin_location: string;
    msg: string;
    name_prob: number;
    cover_prob_front: number;
    back_type_id: number;
    address_fake_warning: boolean;
    checking_result_back: {
      corner_cut_result: string;
      edited_prob: number;
      recaptured_result: string;
      check_photocopied_prob: number;
      corner_cut_prob: number[];
      check_photocopied_result: string;
      edited_result: string;
      recaptured_prob: number;
    };
    nation_policy: string;
    general_warning: any[]; // You might want to define a more specific type if you know the structure of general_warning elements
    features: string;
    dupplication_warning: boolean;
    quality_back: {
      blur_score: number;
      bright_spot_param: {
        average_intensity: number;
        bright_spot_threshold: number;
        total_bright_spot_area: number;
      };
      luminance_score: number;
      final_result: {
        bad_luminance_likelihood: string;
        low_resolution_likelihood: string;
        blurred_likelihood: string;
        bright_spot_likelihood: string;
      };
      bright_spot_score: number;
      resolution: number[];
    };
    checking_result_front: {
      corner_cut_result: string;
      edited_prob: number;
      recaptured_result: string;
      check_photocopied_prob: number;
      corner_cut_prob: number[];
      check_photocopied_result: string;
      edited_result: string;
      recaptured_prob: number;
    };
    back_corner_warning: string;
    id: string;
    back_expire_warning: string;
    msg_back: string;
    birth_day_prob: number;
    recent_location: string;
    id_fake_warning: string;
    name_probs: number[];
    issue_date_prob: number;
    citizen_id: string;
    recent_location_prob: number;
    issue_place_prob: number;
    nationality: string;
    place_birth_prob: number;
    name: string;
    gender: string;
    name_fake_warning_prob: number;
    expire_warning: string;
    issue_date_probs: number[];
    valid_date_prob: number;
    origin_location_prob: number;
    corner_warning: string;
    mrz_valid_score: number;
    valid_date: string;
    issue_date: string;
    id_fake_prob: number;
    mrz_prob: number;
    id_probs: string; // This appears to be a string representation of an array
    citizen_id_prob: number;
    dob_fake_warning_prob: number;
    features_prob: number;
    issue_place: string;
    dob_fake_warning: boolean;
    name_fake_warning: string;
    type_id: number;
    mrz_probs: number[];
    card_type: string;
    quality_front: {
      blur_score: number;
      bright_spot_param: {
        average_intensity: number;
        bright_spot_threshold: number;
        total_bright_spot_area: number;
      };
      luminance_score: number;
      final_result: {
        bad_luminance_likelihood: string;
        low_resolution_likelihood: string;
        blurred_likelihood: string;
        bright_spot_likelihood: string;
      };
      bright_spot_score: number;
      resolution: number[];
    };
    match_front_back: {
      match_sex: string;
      match_bod: string;
      match_id: string;
      match_valid_date: string;
      match_name: string;
    };
    birth_day: string;
    mrz: string[];
    post_code: Array<{
      debug: string;
      city: [string, string, number];
      district: [string, string, number];
      ward: [string, string, number];
      detail: string;
      type: string;
    }>;
    issuedate_fake_warning: boolean;
    tampering: {
      is_legal: string;
      warning: any[]; // You might want to define a more specific type for warning elements
    };
  };
  statusCode: number;
  challengeCode: string;
}

export interface MaskedData {
  imgs: {
    img: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: {
    masked: string;
  };
  statusCode: number;
  challengeCode: string;
}

export interface CompareData {
  imgs: {
    img_face: string;
    img_front: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: {
    result: string;
    msg: string;
    prob: number;
    match_warning: string;
    multiple_faces: boolean;
  };
  statusCode: number;
  challengeCode: string;
}

export interface Base64DocImg {
  img_front: string;
}

export interface EkycResponse {
  type_document: number;
  liveness_card_front: LivenessCardData;
  liveness_card_back: LivenessCardData;
  ocr: OCRData;
  liveness_face: boolean;
  masked: MaskedData;
  hash_img: string;
  compare: CompareData;
  base64_doc_img: Base64DocImg;
}