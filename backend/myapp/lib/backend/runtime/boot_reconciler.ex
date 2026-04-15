defmodule Backend.Runtime.BootReconciler do
  use Task, restart: :transient

  require Logger

  alias Backend.Agents

  def start_link(arg \\ []) do
    Task.start_link(__MODULE__, :run, [arg])
  end

  def run(_arg) do
    count =
      Agents.list_working_agents()
      |> Enum.reduce(0, fn agent, acc ->
        case Backend.Runtime.AgentRuntimeSupervisor.ensure_started(agent) do
          {:ok, _pid} -> acc + 1
          {:error, {:already_started, _pid}} -> acc + 1
          _other -> acc
        end
      end)

    Logger.info("boot reconciler started #{count} working agent runtimes")
    :ok
  end
end
