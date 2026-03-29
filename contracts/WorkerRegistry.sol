// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WorkerRegistry
/// @notice Directory of workers with capabilities and chain locations.
contract WorkerRegistry {
    struct Worker {
        address addr;
        string capability;
        uint32 chainEid;
        bool active;
    }

    mapping(address => Worker) public workers;
    address[] public workerList;

    event WorkerRegistered(address indexed worker, string capability, uint32 chainEid);
    event WorkerDeactivated(address indexed worker);

    function register(string calldata capability, uint32 chainEid) external {
        if (!workers[msg.sender].active) {
            workerList.push(msg.sender);
        }
        workers[msg.sender] = Worker(msg.sender, capability, chainEid, true);
        emit WorkerRegistered(msg.sender, capability, chainEid);
    }

    function deactivate() external {
        workers[msg.sender].active = false;
        emit WorkerDeactivated(msg.sender);
    }

    function getWorker(address addr) external view returns (Worker memory) {
        return workers[addr];
    }

    function getWorkerCount() external view returns (uint256) {
        return workerList.length;
    }

    function findWorkers(string calldata capability) external view returns (Worker[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < workerList.length; i++) {
            if (workers[workerList[i]].active && keccak256(bytes(workers[workerList[i]].capability)) == keccak256(bytes(capability))) {
                count++;
            }
        }
        Worker[] memory result = new Worker[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < workerList.length; i++) {
            if (workers[workerList[i]].active && keccak256(bytes(workers[workerList[i]].capability)) == keccak256(bytes(capability))) {
                result[j++] = workers[workerList[i]];
            }
        }
        return result;
    }
}
