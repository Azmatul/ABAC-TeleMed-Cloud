// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccessControlABAC is AccessControl {
    bytes32 public constant DOCTOR_ROLE  = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");

    // String-hash constants for comparison (case-sensitive)
    bytes32 private constant DOCTOR_STR_HASH  = keccak256(abi.encodePacked("DOCTOR"));
    bytes32 private constant PATIENT_STR_HASH = keccak256(abi.encodePacked("PATIENT"));

    struct AccessRequest {
        address requester;
        string role; // "DOCTOR" or "PATIENT"
        string meta; // optional note
        bool approved;
        bool exists;
    }

    mapping(address => AccessRequest) public requests;

    event RoleRequested(address indexed requester, string role, string meta);
    event RoleApproved(address indexed requester, string role);

    constructor() {
        // Deployer (Account #0 in Hardhat) becomes the sole admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function requestRole(string memory role, string memory meta) external {
        require(!requests[msg.sender].exists, "Already requested");

        // Normalize role & validate
        bytes32 h = keccak256(abi.encodePacked(role));
        string memory normalized;
        if (h == DOCTOR_STR_HASH) {
            normalized = "DOCTOR";
        } else if (h == PATIENT_STR_HASH) {
            normalized = "PATIENT";
        } else {
            revert("Invalid role");
        }

        requests[msg.sender] = AccessRequest({
            requester: msg.sender,
            role: normalized,
            meta: meta,
            approved: false,
            exists: true
        });

        emit RoleRequested(msg.sender, normalized, meta);
    }

    function approveRole(address account, string memory role)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(requests[account].exists, "No request");
        require(!requests[account].approved, "Already approved");

        // Normalize & validate again
        bytes32 h = keccak256(abi.encodePacked(role));
        if (h == DOCTOR_STR_HASH) {
            _grantRole(DOCTOR_ROLE, account);
        } else if (h == PATIENT_STR_HASH) {
            _grantRole(PATIENT_ROLE, account);
        } else {
            revert("Invalid role");
        }

        requests[account].approved = true;
        // (Optional) clear the request to allow future re-requests:
        // delete requests[account];

        emit RoleApproved(account, requests[account].role);
    }

    function hasDoctorRole(address account) external view returns (bool) {
        return hasRole(DOCTOR_ROLE, account);
    }

    function hasPatientRole(address account) external view returns (bool) {
        return hasRole(PATIENT_ROLE, account);
    }
}
