alias Backend.Agents
alias Backend.Convoys
alias Backend.Messaging
alias Backend.Tasks

IO.puts("Seeding development data...")

{:ok, alice} = Agents.create_agent(%{name: "alice", capabilities: ["frontend", "testing"]})
{:ok, bob} = Agents.create_agent(%{name: "bob", capabilities: ["backend", "api"]})
{:ok, carol} = Agents.create_agent(%{name: "carol", capabilities: ["devops", "infra"]})
IO.puts("  Created 3 agents: alice, bob, carol")

{:ok, task1} =
  Tasks.create_task(%{
    title: "Implement login form",
    description: "Build login form with validation",
    priority: "high",
    status: "open"
  })

{:ok, task2} =
  Tasks.create_task(%{
    title: "Add user registration",
    description: "Create registration flow",
    priority: "high",
    status: "open"
  })

{:ok, task3} =
  Tasks.create_task(%{
    title: "Write API docs",
    description: "Document REST endpoints",
    priority: "medium",
    status: "in_progress"
  })

{:ok, task4} =
  Tasks.create_task(%{
    title: "Set up CI pipeline",
    description: "Configure GitHub Actions",
    priority: "medium",
    status: "in_progress"
  })

{:ok, task5} =
  Tasks.create_task(%{
    title: "Fix database migration",
    description: "Resolve migration conflict",
    priority: "critical",
    status: "completed"
  })

{:ok, task6} =
  Tasks.create_task(%{
    title: "Design system audit",
    description: "Review component consistency",
    priority: "low",
    status: "blocked"
  })

IO.puts("  Created 6 tasks")

{:ok, convoy1} =
  Convoys.create_convoy(%{
    name: "Sprint 1 - Auth",
    description: "User auth features",
    task_ids: [task1.id, task2.id]
  })

{:ok, convoy2} =
  Convoys.create_convoy(%{
    name: "Sprint 2 - DevOps",
    description: "Infrastructure work",
    task_ids: [task3.id, task4.id, task5.id, task6.id]
  })

IO.puts("  Created 2 convoys: Sprint 1 - Auth, Sprint 2 - DevOps")

{:ok, _msg1} =
  Messaging.send_message(alice.id, %{sender: "system", content: "Welcome to CreateSuite!"})

{:ok, _msg2} =
  Messaging.send_message(bob.id, %{
    sender: "alice",
    content: "Hey bob, how's the API work coming?"
  })

{:ok, _msg3} =
  Messaging.send_message(bob.id, %{
    sender: "bob",
    content: "Going great! I'll have docs ready today."
  })

{:ok, _msg4} =
  Messaging.send_message(carol.id, %{sender: "carol", content: "CI pipeline is ready for review"})

IO.puts("  Created 4 messages")

IO.puts("Seed complete!")
