defmodule BackendWeb.AgentJSON do
  def index(%{agents: agents}) do
    %{agents: Enum.map(agents, &agent/1)}
  end

  def show(%{agent: agent}) do
    %{agent: agent(agent)}
  end

  def agent(agent) do
    %{
      id: agent.id,
      name: agent.name,
      status: agent.status,
      capabilities: agent.capabilities,
      currentTaskId: agent.current_task_id,
      createdAt: agent.inserted_at,
      updatedAt: agent.updated_at
    }
  end
end
