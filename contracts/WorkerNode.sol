// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OApp, MessagingFee, MessagingReceipt, Origin} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title WorkerNode
/// @notice Worker agent on destination chain. Receives tasks via LayerZero, submits results back.
contract WorkerNode is OApp {
    struct ReceivedTask {
        uint256 taskId;
        string description;
        uint256 reward;
        address assignedWorker;
        bool completed;
    }

    mapping(uint256 => ReceivedTask) public receivedTasks;
    uint256[] public taskIds;

    event TaskReceived(uint256 indexed taskId, string description, address worker);
    event ResultSubmitted(uint256 indexed taskId, bytes32 resultHash);

    error TaskNotReceived();
    error AlreadyCompleted();

    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    /// @notice Receive task from TaskManager via LayerZero
    function _lzReceive(
        Origin calldata,
        bytes32,
        bytes calldata _message,
        address,
        bytes calldata
    ) internal override {
        (uint256 taskId, string memory description, uint256 reward, address worker) =
            abi.decode(_message, (uint256, string, uint256, address));

        receivedTasks[taskId] = ReceivedTask({
            taskId: taskId,
            description: description,
            reward: reward,
            assignedWorker: worker,
            completed: false
        });
        taskIds.push(taskId);

        emit TaskReceived(taskId, description, worker);
    }

    /// @notice Worker submits result and sends back to TaskManager
    function submitResult(
        uint256 taskId,
        bytes32 resultHash,
        uint32 srcEid,
        bytes calldata options
    ) external payable {
        ReceivedTask storage task = receivedTasks[taskId];
        if (task.assignedWorker == address(0)) revert TaskNotReceived();
        if (task.completed) revert AlreadyCompleted();

        task.completed = true;

        bytes memory payload = abi.encode(taskId, resultHash, msg.sender);
        _lzSend(srcEid, payload, options, MessagingFee(msg.value, 0), payable(msg.sender));

        emit ResultSubmitted(taskId, resultHash);
    }

    /// @notice Get count of received tasks
    function getTaskCount() external view returns (uint256) {
        return taskIds.length;
    }
}
