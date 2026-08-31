export type UserRole = 
  | 'citizen' 
  | 'authority_officer' 
  | 'geotech_analyst' 
  | 'incident_commander' 
  | 'admin';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlertPriority = 'P1' | 'P2' | 'P3';

export type ReportType = 
  | 'ground_crack' 
  | 'falling_rocks' 
  | 'blocked_road' 
  | 'water_leakage' 
  | 'mud_flow'
  | 'retaining_wall_tilt';

export type ReportStatus = 'pending' | 'verified' | 'dispatched' | 'resolved';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  verificationBadgeNumber?: string;
  department?: string;
  badgeId?: string;
  assignedSector?: string;
  trustedReporterScore?: number;
  emergencyContacts?: { name: string; relation: string; phone: string }[];
  currentLocationName?: string;
  currentCoordinates?: [number, number];
}

export interface FactorBreakdown {
  factor: string;
  impact: number; // 0 to 100 percentage influence
  description: string;
  status: 'safe' | 'caution' | 'danger';
}

export interface SensorDataPoint {
  time: string;
  rainfall: number;
  soilMoisture: number;
  slopeTilt: number;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  capacity: number;
  occupied: number;
  status: 'open' | 'near_capacity' | 'full' | 'evacuating';
  amenities: string[];
  contactPhone: string;
  distanceKm: number;
  foodStockDays: number;
  medicalOfficerPresent: boolean;
}

export interface AreaZone {
  id: string;
  name: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  rainfall24h: number; // mm
  rainfallRate1h: number; // mm/h
  soilMoisture: number; // %
  slopeDegrees: number; // degrees
  elevation: number; // meters
  geologyType: string;
  vegetationCover: number; // %
  population: number;
  criticalInfrastructure: string[];
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  xaiExplanation: string;
  topContributingFactors: FactorBreakdown[];
  alertPriority: AlertPriority;
  evacuationStatus: 'none' | 'advisory' | 'mandatory' | 'completed';
  historicalLandslidesCount: number;
  lastUpdated: string;
  sheltersNearby: Shelter[];
  sensorHistory: SensorDataPoint[];
}

export interface CommunityReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  isVerifiedCitizen: boolean;
  type: ReportType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  locationName: string;
  coordinates: [number, number];
  timestamp: string;
  imageUrl?: string;
  status: ReportStatus;
  assignedTeam?: string;
  encryptedHash: string;
  sha256Checksum: string;
  isEncrypted: boolean;
  upvotes: number;
  authorityNotes?: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  priority: AlertPriority;
  timestamp: string;
  areaId?: string;
  areaName?: string;
  targetAudience: 'all' | 'citizens' | 'authorities';
  isRead: boolean;
  broadcastedBy: string;
  soundAlarm?: boolean;
}

export interface CloudBackupRecord {
  id: string;
  timestamp: string;
  backupName: string;
  sizeBytes: number;
  recordsCount: number;
  sha256Digest: string;
  cloudRegion: string;
  status: 'synced' | 'verified' | 'restoring';
}

export interface EncryptedStorageAudit {
  id: string;
  recordId: string;
  recordType: 'citizen_identity' | 'community_report' | 'emergency_contact' | 'telemetry_stream';
  encryptionAlgorithm: string;
  ivHex: string;
  cipherSnippet: string;
  sha256Checksum: string;
  lastModified: string;
  encryptedBy: string;
}

export type NetworkMode = 'online' | 'offline';

export interface OfflineOutboxItem {
  id: string;
  type: 'report' | 'family_checkin' | 'triage_action' | 'shelter_update';
  title: string;
  data: any;
  createdAt: string;
  synced: boolean;
  meshRelayHops: number;
}

export interface FamilySafetyStatus {
  id: string;
  userName: string;
  userPhone: string;
  status: 'safe' | 'need_help' | 'evacuating' | 'at_shelter';
  locationName: string;
  coordinates?: [number, number];
  timestamp: string;
  notes?: string;
  batteryLevel?: number;
  relayMethod: 'cloud' | 'mesh_bluetooth' | 'emergency_sms';
  verifiedIdentity?: boolean;
}

export interface GeotechSensorFeed {
  sensorId: string;
  zoneId: string;
  sensorType: 'pore_piezometer' | 'tilt_inclinometer' | 'acoustic_emission' | 'soil_moisture_probe';
  label: string;
  currentVal: number;
  unit: string;
  thresholdCritical: number;
  thresholdWarning: number;
  status: 'normal' | 'warning' | 'critical';
  waveform: number[];
  batteryPercent: number;
  lastPacketTime: string;
}

export interface EvacuationRouteOption {
  id: string;
  title: string;
  destinationShelterId: string;
  shelterName: string;
  distanceKm: number;
  estWalkTimeMin: number;
  safetyScore: number;
  hazardAvoidanceNotes: string[];
  elevationGain: number;
  pathCoordinates: [number, number][];
  isRecommended: boolean;
}
