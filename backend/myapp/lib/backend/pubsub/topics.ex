defmodule Backend.PubSub.Topics do
  @agents "agents"
  @tasks "tasks"
  @convoys "convoys"
  @system "system"

  def agents, do: @agents
  def tasks, do: @tasks
  def convoys, do: @convoys
  def system, do: @system
  def agent(id), do: "agents:#{id}"
  def task(id), do: "tasks:#{id}"
  def messages(agent_id), do: "messages:#{agent_id}"
end
