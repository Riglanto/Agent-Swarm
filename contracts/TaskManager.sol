// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OApp, MessagingFee, MessagingReceipt, Origin} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TaskManager
/// @notice Planner agent on Base. Creates tasks, dispatches to workers cross-chain via LayerZero,
///         receives results, and releases rewards.
contract TaskManager is OApp {
    enum TaskStatus { Created, Dispatched, Completed, Paid }

    struct Task {
        uint256 id;
        string description;
        uint256 reward;
        address creator;
        address worker;
        bytes32 resultHash;
        TaskStatus status;
        uint32 workerChainEid;
    }

    uint256 public nextTaskId;
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 indexed taskId, string description, uint256 reward);
    event TaskDispatched(uint256 indexed taskId, uint32 dstEid, bytes32 guid);
    event ResultReceived(uint256 indexed taskId, bytes32 resultHash, address worker);
    event RewardReleased(uint256 indexed taskId, address worker, uint256 reward);

    error TaskNotFound();
    error InvalidStatus();
    error NotTaskCreator();
    error InsufficientReward();

    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    /// @notice Create a task with ETH reward locked in contract
    function createTask(string calldata description) external payable returns (uint256 taskId) {
        if (msg.value == 0) revert InsufficientReward();
        taskId = nextTaskId++;
        tasks[taskId] = Task({
            id: taskId,
            description: description,
            reward: msg.value,
            creator: msg.sender,
            worker: address(0),
            resultHash: bytes32(0),
            status: TaskStatus.Created,
            workerChainEid: 0
        });
        emit TaskCreated(taskId, description, msg.value);
    }

    /// @notice Dispatch task to a worker on another chain via LayerZero
    function dispatchTask(
        uint256 taskId,
        address worker,
        uint32 dstEid,
        bytes calldata options
    ) external payable {
        Task storage task = tasks[taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (task.status != TaskStatus.Created) revert InvalidStatus();
        if (task.creator != msg.sender) revert NotTaskCreator();

        task.status = TaskStatus.Dispatched;
        task.worker = worker;
        task.workerChainEid = dstEid;

        bytes memory payload = abi.encode(taskId, task.description, task.reward, worker);
        MessagingReceipt memory receipt = _lzSend(dstEid, payload, options, MessagingFee(msg.value, 0), payable(msg.sender));

        emit TaskDispatched(taskId, dstEid, receipt.guid);
    }

    /// @notice Receive result from worker via LayerZero
    function _lzReceive(
        Origin calldata,
        bytes32,
        bytes calldata _message,
        address,
        bytes calldata
    ) internal override {
        (uint256 taskId, bytes32 resultHash, address worker) = abi.decode(_message, (uint256, bytes32, address));

        Task storage task = tasks[taskId];
        if (task.status == TaskStatus.Dispatched) {
            task.resultHash = resultHash;
            task.status = TaskStatus.Completed;
            emit ResultReceived(taskId, resultHash, worker);
        }
    }

    /// @notice Release reward to worker after result verified
    function releaseReward(uint256 taskId) external {
        Task storage task = tasks[taskId];
        if (task.creator != msg.sender) revert NotTaskCreator();
        if (task.status != TaskStatus.Completed) revert InvalidStatus();

        task.status = TaskStatus.Paid;
        payable(task.worker).transfer(task.reward);
        emit RewardReleased(taskId, task.worker, task.reward);
    }

    /// @notice Quote dispatch fee
    function quoteDispatch(uint256 taskId, uint32 dstEid, address worker, bytes calldata options)
        external view returns (MessagingFee memory)
    {
        Task storage task = tasks[taskId];
        bytes memory payload = abi.encode(taskId, task.description, task.reward, worker);
        return _quote(dstEid, payload, options, false);
    }
}
