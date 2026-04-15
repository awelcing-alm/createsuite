defmodule BackendWeb.ConvoyJSON do
  alias BackendWeb.TaskJSON

  def index(%{convoys: convoys}) do
    %{convoys: Enum.map(convoys, &convoy/1)}
  end

  def show(%{convoy: convoy}) do
    %{convoy: convoy(convoy)}
  end

  def convoy(%{convoy: convoy, tasks: tasks, progress: progress}) do
    %{
      id: convoy.cs_id,
      uuid: convoy.id,
      name: convoy.name,
      description: convoy.description,
      progress: %{
        total: progress.total,
        completed: progress.completed,
        percentage: progress.percentage
      },
      tasks: Enum.map(tasks, &TaskJSON.task/1),
      createdAt: convoy.inserted_at,
      updatedAt: convoy.updated_at
    }
  end
end
