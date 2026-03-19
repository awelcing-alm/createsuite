use rust_diagrams::diagram_types::{
    ActorType, MessageType, SequenceActor, SequenceDiagram, SequenceMessage,
};
use std::fs;

fn main() {
    println!("Generating Sequence Diagram Example...\n");

    let diagram = SequenceDiagram::new("Agent Task Lifecycle")
        .add_actor(SequenceActor {
            id: "user".to_string(),
            name: "User".to_string(),
            actor_type: ActorType::User,
        })
        .add_actor(SequenceActor {
            id: "ui".to_string(),
            name: "Agent UI".to_string(),
            actor_type: ActorType::Agent,
        })
        .add_actor(SequenceActor {
            id: "orchestrator".to_string(),
            name: "Orchestrator".to_string(),
            actor_type: ActorType::Service,
        })
        .add_actor(SequenceActor {
            id: "task-mgr".to_string(),
            name: "Task Manager".to_string(),
            actor_type: ActorType::Service,
        })
        .add_actor(SequenceActor {
            id: "git".to_string(),
            name: "Git Storage".to_string(),
            actor_type: ActorType::System,
        })
        .add_message(SequenceMessage {
            id: "1".to_string(),
            from: "user".to_string(),
            to: "ui".to_string(),
            label: "Create Task".to_string(),
            message_type: MessageType::Sync,
            step: 1,
        })
        .add_message(SequenceMessage {
            id: "2".to_string(),
            from: "ui".to_string(),
            to: "orchestrator".to_string(),
            label: "Task:Create".to_string(),
            message_type: MessageType::Async,
            step: 2,
        })
        .add_message(SequenceMessage {
            id: "3".to_string(),
            from: "orchestrator".to_string(),
            to: "task-mgr".to_string(),
            label: "Store Task".to_string(),
            message_type: MessageType::Sync,
            step: 3,
        })
        .add_message(SequenceMessage {
            id: "4".to_string(),
            from: "task-mgr".to_string(),
            to: "git".to_string(),
            label: "Git Commit".to_string(),
            message_type: MessageType::Sync,
            step: 4,
        })
        .add_message(SequenceMessage {
            id: "5".to_string(),
            from: "git".to_string(),
            to: "task-mgr".to_string(),
            label: "OK".to_string(),
            message_type: MessageType::Response,
            step: 5,
        })
        .add_message(SequenceMessage {
            id: "6".to_string(),
            from: "task-mgr".to_string(),
            to: "orchestrator".to_string(),
            label: "Task Created".to_string(),
            message_type: MessageType::Response,
            step: 6,
        })
        .add_message(SequenceMessage {
            id: "7".to_string(),
            from: "orchestrator".to_string(),
            to: "ui".to_string(),
            label: "Task:Created".to_string(),
            message_type: MessageType::Async,
            step: 7,
        })
        .add_message(SequenceMessage {
            id: "8".to_string(),
            from: "ui".to_string(),
            to: "user".to_string(),
            label: "Display Task".to_string(),
            message_type: MessageType::Response,
            step: 8,
        });

    let svg = diagram.render_svg();

    std::fs::create_dir_all("outputs").ok();
    std::fs::write("outputs/sequence-example.svg", &svg).expect("Failed to write SVG");

    println!("Generated: outputs/sequence-example.svg");
    println!("\nSVG preview (first 500 chars):");
    println!("{}", &svg[..svg.len().min(500)]);
}
