<script setup lang="ts">
import { type IForm, type IFormApproval, type IFormError } from './form';
import { useSelectableUsers } from '@/composables/selectable/users';

const data = defineModel<IForm>('data', {
  default: () => ({
    approvals: [],
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    approvals: [],
  }),
});

const roles = [
  { label: 'reviewer', value: 'reviewer' },
  { label: 'approval', value: 'approval' }
]

const { options: userOptions, searchUser } = useSelectableUsers();

const addApproval = () => {
  data.value.approvals?.push({
    user_id: '',
    role: '',
    initial_name: '',
    name: '',
    email: '',
  })
}

const onSelectedApproval = (selected: IFormApproval, approval: IFormApproval) => {
  approval.name = selected.name;
  approval.email = selected.email;
  approval.initial_name = selected.initial_name;
};

const removeApproval = (index: number) => {
  data.value.approvals?.splice(index, 1)
}
</script>

<template>
  <base-card title="Choose users who can sign documents">
    <div class="flex flex-col gap-4">
      <base-table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(approval, rowIndex) in data.approvals">
            <td>
              <base-choosen
                title="User"
                v-model="approval.user_id"
                v-model:search="searchUser"
                @select="(selected: IFormApproval) => onSelectedApproval(selected, approval)"
                :options="userOptions"
                :errors="errors?.[`approvals.${rowIndex}.user_id`]"
                placeholder="Select"
                border="none"
                paddingless
              />
            </td>
            <td>
              <base-choosen
                title="User"
                v-model="approval.role"
                :options="roles"
                :errors="errors?.[`approvals.${rowIndex}.role`]"
                placeholder="Select"
                border="none"
                paddingless
              />
            </td>
            <td class="text-right">
              <button @click="removeApproval(rowIndex)"><i class="i-fa7-solid:x"></i></button>
            </td>
          </tr>
        </tbody>
      </base-table>
      <div>
        <base-button variant="filled" color="primary" @click="addApproval">Add</base-button>
      </div>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
